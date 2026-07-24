#!/usr/bin/env node
// Keep in sync with packages/twenty-oxlint-rules/rules/no-feature-imports-in-ui.ts.
import { execFileSync } from 'child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const packageRoot = join(fileURLToPath(import.meta.url), '..', '..');
const uiRoot = join(packageRoot, 'src', 'modules', 'ui');
const baselinePath = join(packageRoot, '.ui-boundary-baseline.json');

const EXEMPT_FILE_MARKERS = [
  '.test.',
  '.spec.',
  '.stories.',
  '/__tests__/',
  '/__mocks__/',
  '/__stories__/',
];

const isBannedImport = (importSource) => {
  if (importSource.startsWith('@/')) {
    if (importSource.includes('/../') || importSource.endsWith('/..')) {
      return true;
    }

    return importSource !== '@/ui' && !importSource.startsWith('@/ui/');
  }

  if (
    importSource === '@apollo/client' ||
    importSource.startsWith('@apollo/client/')
  ) {
    return true;
  }

  if (importSource.startsWith('~/generated')) {
    return true;
  }

  return false;
};

const listSourceFiles = (dir) => {
  const files = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);

    if (statSync(fullPath).isDirectory()) {
      files.push(...listSourceFiles(fullPath));
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
};

const IMPORT_SOURCE_PATTERN =
  /(?:from\s+|import\s*\(\s*|import\s+)[`'"]([^`'"]+)[`'"]/g;

const scanViolations = () => {
  const entries = {};

  for (const filePath of listSourceFiles(uiRoot)) {
    const normalizedPath = filePath.replace(/\\/g, '/');

    if (EXEMPT_FILE_MARKERS.some((marker) => normalizedPath.includes(marker))) {
      continue;
    }

    const source = readFileSync(filePath, 'utf8');
    const violations = new Set();

    for (const match of source.matchAll(IMPORT_SOURCE_PATTERN)) {
      if (!match[1].includes('${') && isBannedImport(match[1])) {
        violations.add(match[1]);
      }
    }

    if (violations.size > 0) {
      const key = relative(packageRoot, filePath).replace(/\\/g, '/');

      entries[key] = [...violations].sort();
    }
  }

  return Object.fromEntries(
    Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)),
  );
};

const readBranchPointBaseline = () => {
  try {
    const mergeBase = execFileSync(
      'git',
      ['merge-base', 'HEAD', 'origin/main'],
      { cwd: packageRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    ).trim();
    const repoPrefix = execFileSync('git', ['rev-parse', '--show-prefix'], {
      cwd: packageRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    const blob = execFileSync(
      'git',
      ['show', `${mergeBase}:${repoPrefix}.ui-boundary-baseline.json`],
      { cwd: packageRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );

    return JSON.parse(blob).entries ?? {};
  } catch {
    return null;
  }
};

const currentEntries = scanViolations();

if (process.argv.includes('--check')) {
  let committed = {};

  try {
    committed = JSON.parse(readFileSync(baselinePath, 'utf8')).entries ?? {};
  } catch {
    console.error(
      `ui-boundary-baseline: missing or unreadable ${baselinePath}`,
    );
    process.exit(1);
  }

  const stale = [];
  const missing = [];

  for (const [file, specifiers] of Object.entries(committed)) {
    for (const specifier of specifiers) {
      if (!(currentEntries[file] ?? []).includes(specifier)) {
        stale.push(`${file} -> ${specifier}`);
      }
    }
  }

  for (const [file, specifiers] of Object.entries(currentEntries)) {
    for (const specifier of specifiers) {
      if (!(committed[file] ?? []).includes(specifier)) {
        missing.push(`${file} -> ${specifier}`);
      }
    }
  }

  if (stale.length > 0) {
    console.error(
      'ui-boundary-baseline: stale entries (violation fixed — remove from .ui-boundary-baseline.json; the baseline only shrinks):',
    );
    stale.forEach((line) => console.error(`  ${line}`));
  }

  if (missing.length > 0) {
    console.error(
      'ui-boundary-baseline: new violations not in the baseline (fix the import — src/modules/ui must not depend on feature modules):',
    );
    missing.forEach((line) => console.error(`  ${line}`));
  }

  const branchPointEntries = readBranchPointBaseline();
  const grown = [];

  if (branchPointEntries !== null) {
    for (const [file, specifiers] of Object.entries(committed)) {
      for (const specifier of specifiers) {
        if (!(branchPointEntries[file] ?? []).includes(specifier)) {
          grown.push(`${file} -> ${specifier}`);
        }
      }
    }

    if (grown.length > 0) {
      console.error(
        'ui-boundary-baseline: baseline grew relative to the branch point (the baseline only shrinks — fix the import instead of baselining it):',
      );
      grown.forEach((line) => console.error(`  ${line}`));
    }
  }

  if (stale.length > 0 || missing.length > 0 || grown.length > 0) {
    process.exit(1);
  }

  console.log('ui-boundary-baseline: OK');
  process.exit(0);
}

writeFileSync(
  baselinePath,
  `${JSON.stringify({ entries: currentEntries }, null, 2)}\n`,
);
console.log(
  `ui-boundary-baseline: wrote ${Object.values(currentEntries).flat().length} entries across ${Object.keys(currentEntries).length} files`,
);

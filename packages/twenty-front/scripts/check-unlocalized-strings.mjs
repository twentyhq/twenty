import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONTEND_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPOSITORY_ROOT = resolve(FRONTEND_ROOT, '../..');
const SOURCE_PREFIX = 'packages/twenty-front/';
const RULE_CODE = 'lingui(no-unlocalized-strings)';
const BASE_REF = process.env.LINGUI_LINT_BASE_SHA || 'origin/main';
const CHECK_ALL = process.argv.length === 3 && process.argv[2] === '--all';

if (process.argv.length > 2 && !CHECK_ALL) {
  throw new Error('Usage: node check-unlocalized-strings.mjs [--all]');
}

const run = (command, arguments_, cwd) => {
  const result = spawnSync(command, arguments_, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });

  if (result.error) {
    throw result.error;
  }

  return result;
};

const isProductionSource = (path) =>
  path.startsWith(`${SOURCE_PREFIX}src/`) &&
  /\.tsx?$/.test(path) &&
  !/(^|\/)(__mocks__|__tests__|__stories__|testing|generated[^/]*)\//.test(
    path,
  ) &&
  !/\.(test|spec|stories|mock)\.tsx?$/.test(path);

const getProductionSourceFiles = (directory) =>
  readdirSync(resolve(FRONTEND_ROOT, directory), {
    withFileTypes: true,
  }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;

    if (entry.isDirectory()) {
      return getProductionSourceFiles(path);
    }

    return entry.isFile() && isProductionSource(`${SOURCE_PREFIX}${path}`)
      ? [path]
      : [];
  });

const getAddedLines = (patch) => {
  const addedLinesByFile = new Map();
  let currentFile;

  for (const line of patch.split('\n')) {
    if (line.startsWith('+++ ')) {
      const gitPath = line.slice(4);
      const decodedPath = gitPath.startsWith('"')
        ? JSON.parse(gitPath)
        : gitPath;

      currentFile = decodedPath.startsWith('b/')
        ? decodedPath.slice(2)
        : undefined;

      if (currentFile && isProductionSource(currentFile)) {
        addedLinesByFile.set(currentFile, new Set());
      }
    }

    if (!currentFile || !isProductionSource(currentFile)) {
      continue;
    }

    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);

    if (!hunk) {
      continue;
    }

    const firstLine = Number(hunk[1]);
    const lineCount = hunk[2] === undefined ? 1 : Number(hunk[2]);

    for (
      let lineNumber = firstLine;
      lineNumber < firstLine + lineCount;
      lineNumber++
    ) {
      addedLinesByFile.get(currentFile).add(lineNumber);
    }
  }

  return addedLinesByFile;
};

let addedLinesByFile = new Map();
let filesToLint;

if (CHECK_ALL) {
  filesToLint = getProductionSourceFiles('src');
} else {
  const diff = run(
    'git',
    [
      '-c',
      'core.quotePath=false',
      'diff',
      '--no-ext-diff',
      '--unified=0',
      BASE_REF,
      '--',
      `${SOURCE_PREFIX}src/`,
    ],
    REPOSITORY_ROOT,
  );

  if (diff.status !== 0) {
    throw new Error(diff.stderr || `Could not compare source with ${BASE_REF}`);
  }

  addedLinesByFile = getAddedLines(diff.stdout);
  filesToLint = [...addedLinesByFile]
    .filter(([, lines]) => lines.size > 0)
    .map(([path]) => path.slice(SOURCE_PREFIX.length));
}

if (filesToLint.length === 0) {
  console.log(
    CHECK_ALL
      ? 'No production frontend source files to check for translations.'
      : 'No added frontend source lines to check for translations.',
  );
  process.exit(0);
}

const MAX_FILE_ARGUMENT_BYTES = 64 * 1024;
const fileBatches = [];
let fileBatch = [];
let argumentBytes = 0;

for (const file of filesToLint) {
  const fileBytes = Buffer.byteLength(file) + 1;

  if (
    argumentBytes + fileBytes > MAX_FILE_ARGUMENT_BYTES &&
    fileBatch.length > 0
  ) {
    fileBatches.push(fileBatch);
    fileBatch = [];
    argumentBytes = 0;
  }

  fileBatch.push(file);
  argumentBytes += fileBytes;
}

fileBatches.push(fileBatch);

const diagnostics = [];

for (const batch of fileBatches) {
  const lint = run(
    process.execPath,
    [
      '../../node_modules/oxlint/bin/oxlint',
      '-c',
      '.oxlintrc.i18n.json',
      '--format=json',
      ...batch,
    ],
    FRONTEND_ROOT,
  );

  let batchDiagnostics;

  try {
    batchDiagnostics = JSON.parse(lint.stdout).diagnostics;
  } catch {
    throw new Error(
      lint.stderr || lint.stdout || 'Oxlint did not return JSON diagnostics.',
    );
  }

  if (lint.status !== 0 && lint.status !== 1) {
    throw new Error(
      lint.stderr || `Oxlint failed with exit code ${lint.status}`,
    );
  }

  diagnostics.push(...batchDiagnostics);
}

const unexpectedErrors = diagnostics.filter(
  (diagnostic) =>
    diagnostic.severity === 'error' && diagnostic.code !== RULE_CODE,
);

if (unexpectedErrors.length > 0) {
  throw new Error(
    `Oxlint reported ${unexpectedErrors.length} unexpected errors.`,
  );
}

const sourceFiles = new Map();
const violationLines = new Map();

const violations = diagnostics.filter((diagnostic) => {
  if (diagnostic.code !== RULE_CODE) {
    return false;
  }

  if (CHECK_ALL) {
    return true;
  }

  const changedLines = addedLinesByFile.get(
    `${SOURCE_PREFIX}${diagnostic.filename}`,
  );
  const span = diagnostic.labels[0]?.span;

  if (!changedLines || !span) {
    return false;
  }

  let source = sourceFiles.get(diagnostic.filename);

  if (!source) {
    source = readFileSync(resolve(FRONTEND_ROOT, diagnostic.filename));
    sourceFiles.set(diagnostic.filename, source);
  }

  const text = source
    .subarray(span.offset, span.offset + span.length)
    .toString();
  let line = span.line;

  for (const textLine of text.split('\n')) {
    if (textLine.trim() && changedLines.has(line)) {
      violationLines.set(diagnostic, line);
      return true;
    }

    line++;
  }

  return false;
});

for (const violation of violations) {
  const line = CHECK_ALL
    ? violation.labels[0]?.span.line
    : violationLines.get(violation);

  console.error(`${violation.filename}:${line}: ${violation.message}`);
}

if (violations.length > 0) {
  console.error(
    CHECK_ALL
      ? `${violations.length} string(s) need Lingui translation markers.`
      : `${violations.length} added string(s) need Lingui translation markers.`,
  );
  process.exitCode = 1;
} else {
  console.log(
    CHECK_ALL
      ? 'No untranslated production frontend strings.'
      : 'No new untranslated frontend strings.',
  );
}

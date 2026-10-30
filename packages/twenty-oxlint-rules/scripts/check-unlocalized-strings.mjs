import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStringDiagnosticFilter } from './filter-unlocalized-strings.mjs';

const SHARED_LINT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE_ROOT = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : process.cwd();
const SOURCE_DIRECTORIES = process.argv.slice(3);
const PACKAGE_CONFIG = resolve(PACKAGE_ROOT, '.oxlintrc.i18n.json');
const LINT_CONFIG = existsSync(PACKAGE_CONFIG)
  ? PACKAGE_CONFIG
  : resolve(SHARED_LINT_ROOT, '.oxlintrc.i18n.json');
const RULE_CODE = 'lingui(no-unlocalized-strings)';
const MAX_FILE_ARGUMENT_BYTES = 64 * 1024;

const isProductionSource = (path) =>
  /\.tsx?$/.test(path) &&
  !/(^|\/)(__mocks__|__tests__|__stories__|testing|locales|generated[^/]*)\//.test(
    path,
  ) &&
  !/\.d\.tsx?$/.test(path) &&
  !/\.(test|spec|stories|mock)\.tsx?$/.test(path);

const getProductionSourceFiles = (directory) =>
  readdirSync(resolve(PACKAGE_ROOT, directory), {
    withFileTypes: true,
  }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;

    if (entry.isDirectory()) {
      return getProductionSourceFiles(path);
    }

    return entry.isFile() && isProductionSource(path) ? [path] : [];
  });

const parseDiagnosticsOrThrow = (lint) => {
  try {
    return JSON.parse(lint.stdout).diagnostics;
  } catch {
    throw new Error(
      lint.stderr || lint.stdout || 'Oxlint did not return JSON diagnostics.',
    );
  }
};

const filesToLint = (
  SOURCE_DIRECTORIES.length > 0 ? SOURCE_DIRECTORIES : ['src']
).flatMap(getProductionSourceFiles);

if (filesToLint.length === 0) {
  console.log('No production source files to check for translations.');
  process.exit(0);
}

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
  const lint = spawnSync(
    process.execPath,
    [
      resolve(SHARED_LINT_ROOT, '../../node_modules/oxlint/bin/oxlint'),
      '-c',
      LINT_CONFIG,
      '--format=json',
      ...batch,
    ],
    {
      cwd: PACKAGE_ROOT,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    },
  );

  if (lint.error) {
    throw lint.error;
  }

  const batchDiagnostics = parseDiagnosticsOrThrow(lint);

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

const diagnosticFilters = new Map();

const violations = diagnostics.filter((diagnostic) => {
  if (diagnostic.code !== RULE_CODE) {
    return false;
  }

  let filter = diagnosticFilters.get(diagnostic.filename);

  if (!filter) {
    filter = createStringDiagnosticFilter({
      filename: diagnostic.filename,
      sourceBuffer: readFileSync(resolve(PACKAGE_ROOT, diagnostic.filename)),
    });
    diagnosticFilters.set(diagnostic.filename, filter);
  }

  return filter(diagnostic.labels[0]?.span);
});

for (const violation of violations) {
  console.error(
    `${violation.filename}:${violation.labels[0]?.span.line}: ${violation.message}`,
  );
}

if (violations.length > 0) {
  console.error(
    `${violations.length} string(s) need Lingui translation markers. Wrap user-facing text with t\`\`, msg\`\` or <Trans>, and text that must stay as written with doNotTranslate().`,
  );
  process.exitCode = 1;
} else {
  console.log('No untranslated production strings.');
}

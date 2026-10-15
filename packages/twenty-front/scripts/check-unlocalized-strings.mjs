import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStringDiagnosticFilter } from './filter-unlocalized-strings.mjs';

const FRONTEND_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RULE_CODE = 'lingui(no-unlocalized-strings)';
const MAX_FILE_ARGUMENT_BYTES = 64 * 1024;

const isProductionSource = (path) =>
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

const filesToLint = getProductionSourceFiles('src');

if (filesToLint.length === 0) {
  console.log('No production frontend source files to check for translations.');
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
      '../../node_modules/oxlint/bin/oxlint',
      '-c',
      '.oxlintrc.i18n.json',
      '--format=json',
      ...batch,
    ],
    {
      cwd: FRONTEND_ROOT,
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
    filter = createStringDiagnosticFilter(
      diagnostic.filename,
      readFileSync(resolve(FRONTEND_ROOT, diagnostic.filename)),
    );
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
    `${violations.length} string(s) need Lingui translation markers.`,
  );
  process.exitCode = 1;
} else {
  console.log('No untranslated production frontend strings.');
}

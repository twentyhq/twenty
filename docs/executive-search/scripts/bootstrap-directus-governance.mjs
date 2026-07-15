#!/usr/bin/env node
// bootstrap-directus-governance.mjs — one-time source import.
// Verifies uploaded-artifact hashes, writes sources/source-manifest.json and
// sources/directus-matrix-collection-set.json. Normal generation/validation
// read only committed files; re-bootstrap is forbidden unless source hashes change.
//
// Usage: node bootstrap-directus-governance.mjs --matrix <path> --master-prompt <path>

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { stringifyCanonicalJson } from './lib/canonical-json.mjs';
import { SENTINEL } from './lib/constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function sha256(filePath) {
  if (!existsSync(filePath))
    throw new Error(`Source file not found: ${filePath}`);
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function extractCollectionNames(matrixPath) {
  const text = readFileSync(matrixPath, 'utf8');
  const lines = text.split('\n');
  const names = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Collection mapping rows are lines starting with | ` inside the collection table
    if (/^\| `/.test(line)) {
      const match = line.match(/^\| `([^`]+)`/);
      if (match) names.push(match[1]);
    }
  }
  return [...new Set(names)].sort();
}

function main() {
  const args = process.argv.slice(2);
  let matrixPath = null;
  let masterPromptPath = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--matrix') matrixPath = args[++i];
    if (args[i] === '--master-prompt') masterPromptPath = args[++i];
  }
  if (!matrixPath || !masterPromptPath) {
    console.error(
      'Usage: bootstrap-directus-governance.mjs --matrix <path> --master-prompt <path>',
    );
    process.exit(1);
  }

  const matrixHash = sha256(matrixPath);
  const promptHash = sha256(masterPromptPath);
  const collections = extractCollectionNames(matrixPath);

  console.log(`Matrix SHA-256:    ${matrixHash}`);
  console.log(`Master prompt SHA: ${promptHash}`);
  console.log(`Collections found: ${collections.length}`);

  if (collections.length !== 140) {
    console.error(
      `ERROR: expected 140 collections, found ${collections.length}`,
    );
    process.exit(1);
  }

  // Check if source-manifest already exists with same hashes
  const manifestPath = join(ROOT, 'sources/source-manifest.json');
  if (existsSync(manifestPath)) {
    const existing = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const existingMatrixHash = existing.sources?.find(
      (s) => s.logicalName === 'directus-compatibility-matrix',
    )?.sha256;
    if (existingMatrixHash === matrixHash) {
      console.log('Source hashes unchanged — re-bootstrap not needed.');
      console.log('To force, delete sources/source-manifest.json first.');
      return;
    }
    console.warn(
      'Source hashes changed — re-bootstrapping with review required.',
    );
  }

  const manifest = {
    evidenceVersion: 1,
    capturedAt: new Date().toISOString().split('T')[0],
    sources: [
      {
        logicalName: 'directus-compatibility-matrix',
        originalFile: '1.md',
        sha256: matrixHash,
      },
      {
        logicalName: 'executive-search-master-prompt',
        originalFile: '2.md',
        sha256: promptHash,
      },
    ],
    rawDirectusSchemaAvailable: false,
    directusSchemaFingerprint: SENTINEL,
  };
  writeFileSync(manifestPath, stringifyCanonicalJson(manifest));
  writeFileSync(
    join(ROOT, 'sources/directus-matrix-collection-set.json'),
    stringifyCanonicalJson(collections),
  );

  console.log(`Wrote ${manifestPath}`);
  console.log(`Wrote sources/directus-matrix-collection-set.json`);
  console.log(
    'Bootstrap complete. Review and curate the normative registries.',
  );
}

main();

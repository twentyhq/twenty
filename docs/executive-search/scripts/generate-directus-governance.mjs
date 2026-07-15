#!/usr/bin/env node
// generate-directus-governance.mjs — deterministic inventory generator.
// Reads ONLY committed files (sources/ + directus-collection-map.csv) and
// produces directus-schema-inventory.json. Use --check to verify reproducibility
// without writing.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { stringifyCanonicalJson } from './lib/canonical-json.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..'); // docs/executive-search/

const SENTINEL = 'UNKNOWN_PENDING_SCHEMA_SNAPSHOT';

function readCsv(path) {
  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n');
  const header = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cells = parseCsvLine(lines[i]);
    const row = {};
    header.forEach((h, idx) => { row[h] = cells[idx] ?? ''; });
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line) {
  const cells = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = false;
      } else cur += ch;
    } else {
      if (ch === '"') inQuote = true;
      else if (ch === ',') { cells.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function buildInventory() {
  const sourceManifest = JSON.parse(readFileSync(join(ROOT, 'sources/source-manifest.json'), 'utf8'));
  const collectionSet = JSON.parse(readFileSync(join(ROOT, 'sources/directus-matrix-collection-set.json'), 'utf8'));
  const mapRows = readCsv(join(ROOT, 'directus-collection-map.csv'));

  // Validate set equality
  const mapNames = mapRows.map(r => r.collection).sort();
  const setNames = [...collectionSet].sort();
  const mapNameStr = JSON.stringify(mapNames);
  const setNameStr = JSON.stringify(setNames);
  if (mapNameStr !== setNameStr) {
    const inMapNotSet = mapNames.filter(n => !collectionSet.includes(n));
    const inSetNotMap = collectionSet.filter(n => !mapNames.includes(n));
    throw new Error(`Collection set mismatch:\n  In map not set: ${JSON.stringify(inMapNotSet)}\n  In set not map: ${JSON.stringify(inSetNotMap)}`);
  }

  const dispositions = ['MAPPED', 'REFERENCE_ONLY', 'PORTAL_ONLY', 'LEGACY', 'OUT_OF_SCOPE'];
  const authorities = [
    'DIRECTUS_AUTHORITATIVE', 'TWENTY_AUTHORITATIVE',
    'APPEND_ONLY_BOTH_WITH_SHARED_IDEMPOTENCY',
    'DERIVED_IN_TWENTY_FROM_DIRECTUS', 'DERIVED_IN_DIRECTUS_FROM_TWENTY',
    'REFERENCE_ONLY_NO_REPLICATION', 'NOT_ALLOWED_TO_SYNC',
  ];

  const dispCounts = Object.fromEntries(dispositions.map(d => [d, 0]));
  const authCounts = Object.fromEntries(authorities.map(a => [a, 0]));

  const collections = mapRows.map(r => {
    dispCounts[r.disposition] = (dispCounts[r.disposition] || 0) + 1;
    authCounts[r.canonical_authority] = (authCounts[r.canonical_authority] || 0) + 1;
    return {
      collection: r.collection,
      domain: r.domain,
      proposedTwentyTarget: r.proposed_twenty_target,
      rawAuthority: r.raw_authority,
      canonicalAuthority: r.canonical_authority,
      normalizationStatus: r.normalization_status,
      normalizationLoss: r.normalization_loss,
      sync: r.sync,
      disposition: r.disposition,
      criticalNotes: r.critical_notes,
      source: r.source,
      sourceLine: parseInt(r.source_line, 10),
      fieldType: SENTINEL,
      isNullable: SENTINEL,
      isUnique: SENTINEL,
      relationTarget: SENTINEL,
      deleteBehavior: SENTINEL,
      aiEligibility: SENTINEL,
      dataClassification: SENTINEL,
      retention: SENTINEL,
    };
  });

  return {
    evidenceVersion: sourceManifest.evidenceVersion,
    generatedAt: '1970-01-01T00:00:00.000Z', // deterministic; real run overrides
    sourceManifest,
    rawDirectusSchemaAvailable: false,
    directusSchemaFingerprint: SENTINEL,
    declaredTotals: { collections: 140, fields: 2432, relations: 421 },
    actualCounts: {
      collections: collections.length,
      fields: SENTINEL,
      relations: SENTINEL,
    },
    dispositionCounts: dispCounts,
    authorityCounts: authCounts,
    collections,
  };
}

function main() {
  const check = process.argv.includes('--check');
  const inventory = buildInventory();
  // Set real timestamp only on write; --check uses committed file as-is
  if (!check) {
    inventory.generatedAt = new Date().toISOString();
  }
  const output = stringifyCanonicalJson(inventory);
  const outPath = join(ROOT, 'directus-schema-inventory.json');
  if (check) {
    const existing = readFileSync(outPath, 'utf8');
    const existingObj = JSON.parse(existing);
    const checkObj = JSON.parse(output);
    // Exclude generatedAt from reproducibility check (timestamp varies per run)
    delete existingObj.generatedAt;
    delete checkObj.generatedAt;
    const reCanonical = stringifyCanonicalJson(checkObj);
    const existingCanonical = stringifyCanonicalJson(existingObj);
    if (reCanonical !== existingCanonical) {
      console.error('generate-directus-governance: --check FAILED — inventory is stale');
      console.error('Run without --check to regenerate.');
      process.exit(1);
    }
    console.log('generate-directus-governance: --check PASSED (inventory up to date)');
  } else {
    writeFileSync(outPath, output);
    console.log(`generate-directus-governance: wrote ${outPath} (${inventory.collections.length} collections)`);
  }
}

main();

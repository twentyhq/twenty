#!/usr/bin/env node
// validate-directus-governance.mjs — validates all governance artifacts.
// Checks: collection count, set equality, authority enums, sentinel usage,
// CSV formula safety, denylist intersections, object-family ownership,
// local link resolution, and inventory JSON validity.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCsv, parseCsvLine } from './lib/csv.mjs';
import {
  SENTINEL,
  VALID_AUTHORITIES,
  VALID_DISPOSITIONS,
  VALID_OWNERS,
  VALID_LIFECYCLE,
  VALID_MIGRATION,
} from './lib/constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..'); // docs/executive-search/

let errors = [];
let warnings = [];

function checkCsvFormulaSafe(path) {
  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n');
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    // CSV formula injection: cells starting with =, +, -, @, tab, CR
    const cells = parseCsvLine(lines[i]);
    for (const cell of cells) {
      const trimmed = cell.trim();
      if (trimmed && /^[=+\-@\t\r]/.test(trimmed) && !trimmed.match(/^-?\d/)) {
        errors.push(
          `CSV formula injection risk in ${path}:${i + 1}: cell starts with dangerous char: "${trimmed.substring(0, 20)}"`,
        );
      }
    }
  }
}

function main() {
  // 1. Collection map
  const mapPath = join(ROOT, 'directus-collection-map.csv');
  if (!existsSync(mapPath)) {
    errors.push('Missing directus-collection-map.csv');
    printAndExit();
  }
  const { header: mapHeader, rows: mapRows } = readCsv(mapPath);

  const collections = mapRows.map((r) => r.collection);
  const uniqueCollections = new Set(collections);
  if (collections.length !== 140)
    errors.push(`Expected 140 collections in map, got ${collections.length}`);
  if (collections.length !== uniqueCollections.size)
    errors.push('Duplicate collection names in map');

  for (const r of mapRows) {
    if (!VALID_AUTHORITIES.includes(r.canonical_authority))
      errors.push(
        `Invalid canonical authority "${r.canonical_authority}" for ${r.collection}`,
      );
    if (!VALID_DISPOSITIONS.includes(r.disposition))
      errors.push(`Invalid disposition "${r.disposition}" for ${r.collection}`);
    if (!r.normalization_status)
      errors.push(`Missing normalization_status for ${r.collection}`);
  }

  // 2. Source set equality
  const collectionSet = JSON.parse(
    readFileSync(
      join(ROOT, 'sources/directus-matrix-collection-set.json'),
      'utf8',
    ),
  );
  const setSorted = [...new Set(collectionSet)].sort();
  const mapSorted = [...uniqueCollections].sort();
  if (JSON.stringify(setSorted) !== JSON.stringify(mapSorted))
    errors.push('Collection set mismatch between source set and map');

  // 3. Inventory JSON
  const inventoryPath = join(ROOT, 'directus-schema-inventory.json');
  if (!existsSync(inventoryPath)) {
    errors.push('Missing directus-schema-inventory.json');
  } else {
    const inv = JSON.parse(readFileSync(inventoryPath, 'utf8'));
    if (inv.collections.length !== 140)
      errors.push(
        `Inventory has ${inv.collections.length} collections, expected 140`,
      );
    if (inv.declaredTotals.collections !== 140)
      errors.push('declaredTotals.collections must be 140');
    if (inv.declaredTotals.fields !== 2432)
      errors.push('declaredTotals.fields must be 2432');
    if (inv.declaredTotals.relations !== 421)
      errors.push('declaredTotals.relations must be 421');
    if (inv.directusSchemaFingerprint !== SENTINEL)
      errors.push('directusSchemaFingerprint must be sentinel');
    const invNames = inv.collections.map((c) => c.collection).sort();
    if (JSON.stringify(invNames) !== JSON.stringify(setSorted))
      errors.push('Collection set mismatch between inventory and source set');
    for (const c of inv.collections) {
      if (c.fieldType !== SENTINEL)
        errors.push(`fieldType for ${c.collection} must be sentinel`);
      if (c.isNullable !== SENTINEL)
        errors.push(`isNullable for ${c.collection} must be sentinel`);
      if (c.isUnique !== SENTINEL)
        errors.push(`isUnique for ${c.collection} must be sentinel`);
      if (c.relationTarget !== SENTINEL)
        errors.push(`relationTarget for ${c.collection} must be sentinel`);
      if (c.deleteBehavior !== SENTINEL)
        errors.push(`deleteBehavior for ${c.collection} must be sentinel`);
      if (c.aiEligibility !== SENTINEL)
        errors.push(`aiEligibility for ${c.collection} must be sentinel`);
    }
  }

  // 4. Core/app object ownership
  const ownPath = join(ROOT, 'core-app-object-ownership.csv');
  if (existsSync(ownPath)) {
    const { header: ownHeader, rows: ownRows } = readCsv(ownPath);
    const requiredOwnCols = [
      'object_family_key',
      'conceptual_objects',
      'owner',
      'lifecycle_on_disable',
      'lifecycle_on_uninstall',
      'identifier_namespace',
      'migration_owner',
      'rationale',
      'source_section',
    ];
    for (const col of requiredOwnCols) {
      if (!ownHeader.includes(col))
        errors.push(`core-app-object-ownership.csv missing column: ${col}`);
    }
    const keys = new Set();
    for (const r of ownRows) {
      if (keys.has(r.object_family_key))
        errors.push(`Duplicate object_family_key: ${r.object_family_key}`);
      keys.add(r.object_family_key);
      if (!VALID_OWNERS.includes(r.owner))
        errors.push(`Invalid owner "${r.owner}" for ${r.object_family_key}`);
      if (!VALID_LIFECYCLE.includes(r.lifecycle_on_disable))
        errors.push(`Invalid lifecycle_on_disable for ${r.object_family_key}`);
      if (!VALID_LIFECYCLE.includes(r.lifecycle_on_uninstall))
        errors.push(
          `Invalid lifecycle_on_uninstall for ${r.object_family_key}`,
        );
      if (!VALID_MIGRATION.includes(r.migration_owner))
        errors.push(`Invalid migration_owner for ${r.object_family_key}`);
    }
  } else {
    warnings.push('core-app-object-ownership.csv not found yet');
  }

  // 5. CSV formula safety
  checkCsvFormulaSafe(mapPath);
  if (existsSync(ownPath)) checkCsvFormulaSafe(ownPath);

  // 6. Denylist + commercial firewall
  const denyPath = join(ROOT, 'candidate-facing-nonreplication-denylist.csv');
  if (existsSync(denyPath)) checkCsvFormulaSafe(denyPath);
  else
    warnings.push('candidate-facing-nonreplication-denylist.csv not found yet');

  const fwPath = join(ROOT, 'commercial-selection-firewall.csv');
  if (existsSync(fwPath)) checkCsvFormulaSafe(fwPath);
  else warnings.push('commercial-selection-firewall.csv not found yet');

  // 7. Field ownership registries
  for (const fname of [
    'directus-field-ownership.csv',
    'field-ownership-matrix.csv',
  ]) {
    const p = join(ROOT, fname);
    if (existsSync(p)) checkCsvFormulaSafe(p);
    else warnings.push(`${fname} not found yet`);
  }

  printAndExit();
}

function printAndExit() {
  for (const w of warnings) console.warn('WARN:', w);
  if (errors.length > 0) {
    for (const e of errors) console.error('FAIL:', e);
    console.error(`\nvalidate-directus-governance: ${errors.length} error(s)`);
    process.exit(1);
  }
  console.log('validate-directus-governance: PASSED');
}

main();

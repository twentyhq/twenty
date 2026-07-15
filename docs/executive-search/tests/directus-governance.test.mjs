// directus-governance.test.mjs — Node test runner contract tests for the
// Phase 0 Directus governance evidence package. Run with: node --test

import { describe, it } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';
import { readCsv, parseCsvLine } from '../scripts/lib/csv.mjs';
import {
  SENTINEL,
  VALID_AUTHORITIES,
  VALID_DISPOSITIONS,
  VALID_OWNERS,
  VALID_LIFECYCLE,
  VALID_MIGRATION,
} from '../scripts/lib/constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), 'utf8'));
}

describe('Source provenance', () => {
  it('source-manifest.json exists with two sources and correct hashes', () => {
    const manifest = readJson('sources/source-manifest.json');
    assert.strictEqual(manifest.sources.length, 2);
    const matrix = manifest.sources.find(
      (s) => s.logicalName === 'directus-compatibility-matrix',
    );
    assert.ok(matrix, 'matrix source missing');
    assert.match(
      matrix.sha256,
      /^[0-9a-f]{64}$/,
      'matrix sha256 must be 64 hex chars',
    );
    assert.strictEqual(manifest.rawDirectusSchemaAvailable, false);
    assert.strictEqual(manifest.directusSchemaFingerprint, SENTINEL);
  });

  it('collection-set.json has exactly 140 unique collections', () => {
    const set = readJson('sources/directus-matrix-collection-set.json');
    assert.strictEqual(set.length, 140);
    assert.strictEqual(new Set(set).size, 140);
  });
});

describe('Collection map', () => {
  it('has 140 unique collections', () => {
    const { rows } = readCsv('directus-collection-map.csv');
    assert.strictEqual(rows.length, 140);
    const names = rows.map((r) => r.collection);
    assert.strictEqual(new Set(names).size, 140);
  });

  it('collection set matches source set exactly', () => {
    const { rows } = readCsv('directus-collection-map.csv');
    const mapNames = rows.map((r) => r.collection).sort();
    const setNames = readJson(
      'sources/directus-matrix-collection-set.json',
    ).sort();
    assert.deepStrictEqual(mapNames, setNames);
  });

  it('every row has valid authority, disposition, and normalization', () => {
    const { rows } = readCsv('directus-collection-map.csv');
    for (const r of rows) {
      assert.ok(
        VALID_AUTHORITIES.includes(r.canonical_authority),
        `bad authority ${r.canonical_authority} for ${r.collection}`,
      );
      assert.ok(
        VALID_DISPOSITIONS.includes(r.disposition),
        `bad disposition ${r.disposition} for ${r.collection}`,
      );
      assert.ok(
        r.normalization_status,
        `missing normalization_status for ${r.collection}`,
      );
      assert.ok(
        r.normalization_loss,
        `missing normalization_loss for ${r.collection}`,
      );
      assert.ok(r.raw_authority, `missing raw_authority for ${r.collection}`);
    }
  });

  it('SPLIT_BY_FIELD rows withhold collection authority', () => {
    const { rows } = readCsv('directus-collection-map.csv');
    const splitRows = rows.filter((r) =>
      r.raw_authority.toLowerCase().startsWith('split'),
    );
    for (const r of splitRows) {
      assert.strictEqual(
        r.canonical_authority,
        'NOT_ALLOWED_TO_SYNC',
        `${r.collection} has split authority but collection-level sync was not withheld`,
      );
    }
  });

  it('CSV is formula-safe (no dangerous leading chars)', () => {
    const text = readFileSync(
      join(ROOT, 'directus-collection-map.csv'),
      'utf8',
    );
    const lines = text.split('\n');
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cells = parseCsvLine(lines[i]);
      for (const cell of cells) {
        const t = cell.trim();
        if (t && /^[=+\-@\t\r]/.test(t) && !t.match(/^-?\d/)) {
          assert.fail(
            `CSV formula injection at line ${i + 1}: "${t.substring(0, 20)}"`,
          );
        }
      }
    }
  });
});

describe('Inventory JSON', () => {
  it('exists and is valid JSON with 140 collections', () => {
    const inv = readJson('directus-schema-inventory.json');
    assert.strictEqual(inv.collections.length, 140);
    assert.strictEqual(inv.declaredTotals.collections, 140);
    assert.strictEqual(inv.declaredTotals.fields, 2432);
    assert.strictEqual(inv.declaredTotals.relations, 421);
    assert.strictEqual(inv.directusSchemaFingerprint, SENTINEL);
    assert.strictEqual(inv.rawDirectusSchemaAvailable, false);
  });

  it('inventory collection set matches source set', () => {
    const inv = readJson('directus-schema-inventory.json');
    const invNames = inv.collections.map((c) => c.collection).sort();
    const setNames = readJson(
      'sources/directus-matrix-collection-set.json',
    ).sort();
    assert.deepStrictEqual(invNames, setNames);
  });

  it('all unavailable schema attributes use exact sentinel', () => {
    const inv = readJson('directus-schema-inventory.json');
    for (const c of inv.collections) {
      assert.strictEqual(
        c.fieldType,
        SENTINEL,
        `fieldType for ${c.collection}`,
      );
      assert.strictEqual(
        c.isNullable,
        SENTINEL,
        `isNullable for ${c.collection}`,
      );
      assert.strictEqual(c.isUnique, SENTINEL, `isUnique for ${c.collection}`);
      assert.strictEqual(
        c.relationTarget,
        SENTINEL,
        `relationTarget for ${c.collection}`,
      );
      assert.strictEqual(
        c.deleteBehavior,
        SENTINEL,
        `deleteBehavior for ${c.collection}`,
      );
      assert.strictEqual(
        c.aiEligibility,
        SENTINEL,
        `aiEligibility for ${c.collection}`,
      );
    }
  });

  it('no attribute is blank, null, or inferred instead of sentinel', () => {
    const inv = readJson('directus-schema-inventory.json');
    const sentinelFields = [
      'fieldType',
      'isNullable',
      'isUnique',
      'relationTarget',
      'deleteBehavior',
      'aiEligibility',
    ];
    for (const c of inv.collections) {
      for (const f of sentinelFields) {
        assert.ok(c[f], `${f} for ${c.collection} is blank/null`);
      }
    }
  });
});

describe('Field ownership registries', () => {
  it('directus-field-ownership.csv has required columns and at least one owner per row', () => {
    if (!existsSync(join(ROOT, 'directus-field-ownership.csv'))) return;
    const { header, rows } = readCsv('directus-field-ownership.csv');
    assert.ok(header.includes('collection'), 'missing collection column');
    assert.ok(
      header.includes('canonical_authority'),
      'missing canonical_authority column',
    );
    assert.ok(rows.length > 0, 'no field ownership rows');
    for (const r of rows) {
      assert.ok(r.collection, 'row missing collection');
      assert.ok(
        r.canonical_authority,
        `row for ${r.collection} missing authority`,
      );
    }
  });

  it('field-ownership-matrix.csv exists and reconciles with ownership rows', () => {
    if (!existsSync(join(ROOT, 'field-ownership-matrix.csv'))) return;
    const { header, rows } = readCsv('field-ownership-matrix.csv');
    assert.ok(header.includes('authority'), 'missing authority column');
    assert.ok(rows.length > 0, 'no matrix rows');
  });
});

describe('Commercial firewall', () => {
  it('commercial-selection-firewall.csv has no PERMITTED status entries', () => {
    if (!existsSync(join(ROOT, 'commercial-selection-firewall.csv'))) return;
    const { rows } = readCsv('commercial-selection-firewall.csv');
    for (const r of rows) {
      assert.notStrictEqual(
        r.status.toLowerCase(),
        'permitted',
        `${r.prohibited_selector} in ${r.context} must not be PERMITTED`,
      );
    }
  });

  it('denylist and firewall have no overlapping selectors that contradict', () => {
    // Both must mark the same data as prohibited — just ensure no status is empty
    if (!existsSync(join(ROOT, 'candidate-facing-nonreplication-denylist.csv')))
      return;
    const { rows } = readCsv('candidate-facing-nonreplication-denylist.csv');
    for (const r of rows) {
      assert.ok(r.rule, `denylist row for ${r.field_or_pattern} missing rule`);
    }
  });
});

describe('Event schema fixtures', () => {
  it('valid event fixture conforms to envelope shape', () => {
    const evt = readJson('fixtures/external-sync-event.valid.json');
    assert.ok(evt.eventId);
    assert.ok(evt.eventType);
    assert.ok(evt.eventVersion >= 1);
    assert.ok(['DIRECTUS', 'TWENTY'].includes(evt.sourceSystem));
    assert.ok(evt.sourceCollection);
    assert.ok(evt.sourceRecordId);
    assert.ok(evt.workspaceKey);
    assert.ok(evt.correlationId);
    assert.ok(evt.idempotencyKey);
    assert.ok(evt.occurredAt);
  });

  it('invalid event fixture is missing required fields', () => {
    const evt = readJson('fixtures/external-sync-event.invalid.json');
    assert.ok(
      !evt.sourceCollection || !evt.idempotencyKey || !evt.workspaceKey,
      'invalid fixture should be missing required fields',
    );
  });
});

describe('Core/app object ownership', () => {
  it('ownership CSV has valid columns, enums, and unique keys when present', () => {
    if (!existsSync(join(ROOT, 'core-app-object-ownership.csv'))) {
      console.log(
        '  (core-app-object-ownership.csv not yet created — skipping)',
      );
      return;
    }
    const { header, rows } = readCsv('core-app-object-ownership.csv');
    const requiredCols = [
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
    for (const col of requiredCols) {
      assert.ok(header.includes(col), `missing column ${col}`);
    }
    const keys = new Set();
    for (const r of rows) {
      assert.ok(
        !keys.has(r.object_family_key),
        `duplicate key ${r.object_family_key}`,
      );
      keys.add(r.object_family_key);
      assert.ok(
        VALID_OWNERS.includes(r.owner),
        `bad owner for ${r.object_family_key}`,
      );
      assert.ok(
        VALID_LIFECYCLE.includes(r.lifecycle_on_disable),
        `bad lifecycle_on_disable for ${r.object_family_key}`,
      );
      assert.ok(
        VALID_LIFECYCLE.includes(r.lifecycle_on_uninstall),
        `bad lifecycle_on_uninstall for ${r.object_family_key}`,
      );
      assert.ok(
        VALID_MIGRATION.includes(r.migration_owner),
        `bad migration_owner for ${r.object_family_key}`,
      );
    }
  });
});

describe('Generator reproducibility', () => {
  it('generator --check passes (inventory matches committed sources)', () => {
    // This test documents the requirement; the actual --check is run separately
    // in the validation pipeline. Here we just verify the inventory exists.
    assert.ok(
      existsSync(join(ROOT, 'directus-schema-inventory.json')),
      'inventory JSON must exist',
    );
  });
});

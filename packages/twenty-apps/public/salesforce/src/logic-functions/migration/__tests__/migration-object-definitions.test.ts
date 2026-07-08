import { describe, expect, it } from 'vitest';

import {
  buildBatchSoql,
  buildCountSoql,
  getMigrationObjectDefinition,
  isMigrationObjectKey,
  MIGRATION_OBJECT_DEFINITIONS,
} from 'src/logic-functions/migration/migration-object-definitions';

describe('MIGRATION_OBJECT_DEFINITIONS', () => {
  it('should order companies before the objects that reference them', () => {
    const orderOf = (key: string) =>
      MIGRATION_OBJECT_DEFINITIONS.find((definition) => definition.key === key)
        ?.processingOrder ?? -1;

    expect(orderOf('account')).toBeLessThan(orderOf('contact'));
    expect(orderOf('account')).toBeLessThan(orderOf('opportunity'));
    expect(orderOf('contact')).toBeLessThan(orderOf('task'));
    expect(orderOf('opportunity')).toBeLessThan(orderOf('note'));
  });

  it('should have unique keys and processing orders', () => {
    const keys = MIGRATION_OBJECT_DEFINITIONS.map((definition) => definition.key);
    const orders = MIGRATION_OBJECT_DEFINITIONS.map(
      (definition) => definition.processingOrder,
    );

    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('should always select the Id field needed for the watermark', () => {
    for (const definition of MIGRATION_OBJECT_DEFINITIONS) {
      expect(definition.soqlFields).toContain('Id');
    }
  });
});

describe('buildBatchSoql', () => {
  const accountDefinition = getMigrationObjectDefinition('account')!;
  const leadDefinition = getMigrationObjectDefinition('lead')!;

  it('should build a first batch query without watermark', () => {
    const soql = buildBatchSoql({
      definition: accountDefinition,
      lastProcessedId: null,
      batchSize: 200,
    });

    expect(soql).toContain('FROM Account');
    expect(soql).not.toContain('WHERE');
    expect(soql).toContain('ORDER BY Id ASC LIMIT 200');
  });

  it('should resume after the watermark id', () => {
    const soql = buildBatchSoql({
      definition: accountDefinition,
      lastProcessedId: '001xx000003DGb2AAG',
      batchSize: 50,
    });

    expect(soql).toContain("WHERE Id > '001xx000003DGb2AAG'");
    expect(soql).toContain('LIMIT 50');
  });

  it('should combine the object where clause with the watermark', () => {
    const soql = buildBatchSoql({
      definition: leadDefinition,
      lastProcessedId: '00Qxx000001a2bcEAA',
      batchSize: 100,
    });

    expect(soql).toContain(
      "WHERE IsConverted = false AND Id > '00Qxx000001a2bcEAA'",
    );
  });
});

describe('buildCountSoql', () => {
  it('should count all records for unfiltered objects', () => {
    expect(buildCountSoql(getMigrationObjectDefinition('account')!)).toBe(
      'SELECT COUNT() FROM Account',
    );
  });

  it('should apply the object where clause', () => {
    expect(buildCountSoql(getMigrationObjectDefinition('lead')!)).toBe(
      'SELECT COUNT() FROM Lead WHERE IsConverted = false',
    );
  });
});

describe('isMigrationObjectKey', () => {
  it('should accept known keys and reject unknown ones', () => {
    expect(isMigrationObjectKey('account')).toBe(true);
    expect(isMigrationObjectKey('note')).toBe(true);
    expect(isMigrationObjectKey('Account')).toBe(false);
    expect(isMigrationObjectKey('case')).toBe(false);
  });
});

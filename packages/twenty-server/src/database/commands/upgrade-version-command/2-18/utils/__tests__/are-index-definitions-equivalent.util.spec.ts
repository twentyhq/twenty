import { areIndexDefinitionsEquivalent } from 'src/database/commands/upgrade-version-command/2-18/utils/are-index-definitions-equivalent.util';

describe('areIndexDefinitionsEquivalent', () => {
  it('should return true when definitions only differ by index name', () => {
    expect(
      areIndexDefinitionsEquivalent({
        indexDefinitionA:
          'CREATE UNIQUE INDEX legacyhash ON workspace_test.company USING btree (name)',
        indexDefinitionB:
          'CREATE UNIQUE INDEX "IDX_UNIQUE_new" ON workspace_test.company USING btree (name)',
      }),
    ).toBe(true);
  });

  it('should return true for identical non-unique definitions', () => {
    expect(
      areIndexDefinitionsEquivalent({
        indexDefinitionA:
          'CREATE INDEX a ON workspace_test.company USING gin ("searchVector")',
        indexDefinitionB:
          'CREATE INDEX b ON workspace_test.company USING gin ("searchVector")',
      }),
    ).toBe(true);
  });

  it('should return false when uniqueness differs', () => {
    expect(
      areIndexDefinitionsEquivalent({
        indexDefinitionA:
          'CREATE INDEX a ON workspace_test.company USING btree (name)',
        indexDefinitionB:
          'CREATE UNIQUE INDEX b ON workspace_test.company USING btree (name)',
      }),
    ).toBe(false);
  });

  it('should return false when columns differ', () => {
    expect(
      areIndexDefinitionsEquivalent({
        indexDefinitionA:
          'CREATE INDEX a ON workspace_test.company USING btree (name)',
        indexDefinitionB:
          'CREATE INDEX b ON workspace_test.company USING btree ("createdAt")',
      }),
    ).toBe(false);
  });

  it('should return false when where clauses differ', () => {
    expect(
      areIndexDefinitionsEquivalent({
        indexDefinitionA:
          'CREATE UNIQUE INDEX a ON workspace_test.company USING btree (name) WHERE ("deletedAt" IS NULL)',
        indexDefinitionB:
          'CREATE UNIQUE INDEX b ON workspace_test.company USING btree (name)',
      }),
    ).toBe(false);
  });

  it('should return false for malformed definitions', () => {
    expect(
      areIndexDefinitionsEquivalent({
        indexDefinitionA: 'not an index definition',
        indexDefinitionB: 'not an index definition',
      }),
    ).toBe(false);
  });
});

import { buildRecordCountQuery } from 'src/engine/core-modules/usage-limit/utils/build-record-count-query.util';

describe('buildRecordCountQuery', () => {
  it('sums one exact count per table', () => {
    expect(
      buildRecordCountQuery({
        schemaName: 'workspace_abc',
        tableNames: ['person', '_rocket'],
      }),
    ).toBe(
      'SELECT SUM(quantity)::bigint AS quantity FROM (' +
        'SELECT COUNT(*) AS quantity FROM "workspace_abc"."person"' +
        ' UNION ALL ' +
        'SELECT COUNT(*) AS quantity FROM "workspace_abc"."_rocket"' +
        ') AS record_counts',
    );
  });

  it('reports zero rather than an empty union when there is no table', () => {
    expect(
      buildRecordCountQuery({ schemaName: 'workspace_abc', tableNames: [] }),
    ).toBe('SELECT 0::bigint AS quantity');
  });

  it('quotes identifiers so a table name cannot break out of the query', () => {
    expect(
      buildRecordCountQuery({
        schemaName: 'workspace_abc',
        tableNames: ['we"ird'],
      }),
    ).toContain('"workspace_abc"."we""ird"');
  });
});

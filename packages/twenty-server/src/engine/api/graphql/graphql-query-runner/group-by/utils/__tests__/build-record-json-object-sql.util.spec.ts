import { type GroupByDefinition } from 'src/engine/api/common/common-query-runners/types/group-by-definition.type';
import { buildRecordJsonObjectSql } from 'src/engine/api/graphql/graphql-query-runner/group-by/utils/build-record-json-object-sql.util';
import { SUB_QUERY_ALIAS } from 'src/engine/api/graphql/graphql-query-runner/group-by/services/group-by-with-records.constants';
import { buildColumnResultAlias } from 'src/engine/twenty-orm/sql/utils/build-column-result-alias.util';

const buildGroupByDefinition = (
  overrides: Partial<GroupByDefinition> = {},
): GroupByDefinition => ({
  columnNameWithQuotes: '"company"."companyId"',
  expression: '"company"."companyId"',
  alias: 'company_companyId',
  ...overrides,
});

const buildSubQueryAliases = (columnNames: string[]): Record<string, string> =>
  Object.fromEntries(
    columnNames.map((columnName) => [
      columnName,
      buildColumnResultAlias(SUB_QUERY_ALIAS, columnName),
    ]),
  );

describe('buildRecordJsonObjectSql', () => {
  it('should emit a single JSONB_BUILD_OBJECT for a short column list', () => {
    const sql = buildRecordJsonObjectSql({
      subQueryAliasByColumnName: buildSubQueryAliases(['id', 'name']),
      groupByDefinitions: [buildGroupByDefinition()],
    });

    expect(sql).toBe(
      `JSONB_BUILD_OBJECT('id', "sub_query_id", 'name', "sub_query_name", ` +
        `'company_companyId', "company_companyId")`,
    );
  });

  it('should keep a column named record as a literal key and never as an identifier', () => {
    const sql = buildRecordJsonObjectSql({
      subQueryAliasByColumnName: buildSubQueryAliases(['id', 'record']),
      groupByDefinitions: [buildGroupByDefinition()],
    });

    expect(sql).toContain(`'record', "sub_query_record"`);
    expect(sql).not.toContain('"record"');
  });

  it('should chunk past the postgres 100-argument function limit', () => {
    const columnNames = Array.from(
      { length: 52 },
      (_unused, index) => `column${index}`,
    );

    const sql = buildRecordJsonObjectSql({
      subQueryAliasByColumnName: buildSubQueryAliases(columnNames),
      groupByDefinitions: [buildGroupByDefinition()],
    });

    const chunks = sql.split(' || ');

    expect(chunks).toHaveLength(2);
    expect(chunks[0].split(', ').length / 2).toBe(50);
    expect(chunks[1].split(', ').length / 2).toBe(3);
    expect(
      chunks.every((chunkSql) => chunkSql.startsWith('JSONB_BUILD_OBJECT(')),
    ).toBe(true);
  });

  it('should keep the full column name as the key when its alias was hashed', () => {
    const longColumnName = `shippingAddress${'X'.repeat(50)}AddressPostcode`;
    const subQueryAliasByColumnName = buildSubQueryAliases([longColumnName]);
    const hashedAlias = subQueryAliasByColumnName[longColumnName];

    const sql = buildRecordJsonObjectSql({
      subQueryAliasByColumnName,
      groupByDefinitions: [buildGroupByDefinition()],
    });

    expect(hashedAlias).not.toContain(longColumnName);
    expect(hashedAlias.length).toBeLessThanOrEqual(63);
    expect(sql).toContain(`'${longColumnName}', "${hashedAlias}"`);
  });

  it('should give colliding composite subfield columns distinct aliases', () => {
    const fieldName = 'a'.repeat(40);
    const subQueryAliasByColumnName = buildSubQueryAliases([
      `${fieldName}AddressStreet1`,
      `${fieldName}AddressStreet2`,
    ]);

    const [firstAlias, secondAlias] = Object.values(subQueryAliasByColumnName);

    expect(firstAlias).not.toBe(secondAlias);
    expect(firstAlias.length).toBeLessThanOrEqual(63);
    expect(secondAlias.length).toBeLessThanOrEqual(63);
  });

  it('should escape single quotes in a column name', () => {
    const sql = buildRecordJsonObjectSql({
      subQueryAliasByColumnName: { "it's": 'sub_query_quoted' },
      groupByDefinitions: [],
    });

    expect(sql).toBe(`JSONB_BUILD_OBJECT('it''s', "sub_query_quoted")`);
  });

  it('should emit an empty object when there is nothing to select', () => {
    const sql = buildRecordJsonObjectSql({
      subQueryAliasByColumnName: {},
      groupByDefinitions: [],
    });

    expect(sql).toBe('JSONB_BUILD_OBJECT()');
  });
});

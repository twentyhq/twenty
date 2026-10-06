import { type DataSource } from 'typeorm';

import { readExistingTableNames } from 'src/database/commands/upgrade-version-command/2-46/utils/read-existing-table-names.util';

const buildDataSource = (tableNames: string[]): DataSource =>
  ({
    query: jest
      .fn()
      .mockResolvedValue(tableNames.map((tableName) => ({ tableName }))),
  }) as unknown as DataSource;

describe('readExistingTableNames', () => {
  it('returns the requested tables that exist', async () => {
    const result = await readExistingTableNames({
      dataSource: buildDataSource(['_pet', 'company']),
      schemaName: 'workspace_test',
      tableNames: ['_pet', 'company', '_viewField'],
    });

    expect(result).toEqual(new Set(['_pet', 'company']));
  });

  // Without this, the object would look orphaned and its delete would drop
  // the real table through the same truncation.
  it('finds the truncated table of a 63-character custom object under its requested name', async () => {
    const requestedTableName = `_${'a'.repeat(63)}`;

    const result = await readExistingTableNames({
      dataSource: buildDataSource([requestedTableName.slice(0, 63)]),
      schemaName: 'workspace_test',
      tableNames: [requestedTableName],
    });

    expect(result).toEqual(new Set([requestedTableName]));
  });
});

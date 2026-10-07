import { type DataSource } from 'typeorm';

import { readExistingColumnNamesByTableName } from 'src/database/commands/upgrade-version-command/2-38/utils/read-existing-column-names-by-table-name.util';

const buildDataSource = (
  rows: { tableName: string; columnName: string }[],
): DataSource =>
  ({ query: jest.fn().mockResolvedValue(rows) }) as unknown as DataSource;

describe('readExistingColumnNamesByTableName', () => {
  it('groups columns by table and leaves missing tables out', async () => {
    const result = await readExistingColumnNamesByTableName({
      dataSource: buildDataSource([
        { tableName: 'timelineActivity', columnName: 'id' },
        { tableName: 'timelineActivity', columnName: 'targetPersonId' },
        { tableName: '_pet', columnName: 'id' },
      ]),
      schemaName: 'workspace_test',
      tableNames: ['timelineActivity', '_pet', '_viewField'],
    });

    expect(result).toEqual(
      new Map([
        ['timelineActivity', new Set(['id', 'targetPersonId'])],
        ['_pet', new Set(['id'])],
      ]),
    );
  });

  it('finds the truncated table of a 63-character custom object under its requested name', async () => {
    const requestedTableName = `_${'a'.repeat(63)}`;

    const result = await readExistingColumnNamesByTableName({
      dataSource: buildDataSource([
        { tableName: requestedTableName.slice(0, 63), columnName: 'id' },
      ]),
      schemaName: 'workspace_test',
      tableNames: [requestedTableName],
    });

    expect(result.get(requestedTableName)).toEqual(new Set(['id']));
  });
});

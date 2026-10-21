import { buildWorkspaceDataExportProgress } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-progress.util';

describe('buildWorkspaceDataExportProgress', () => {
  it('sums columns across tables and rows across parts', () => {
    expect(
      buildWorkspaceDataExportProgress({
        workspaceName: 'Acme',
        tables: [
          {
            nameSingular: 'company',
            labelSingular: 'Company',
            tableName: 'company',
            columns: [
              { name: 'id', isText: false },
              { name: 'name', isText: true },
            ],
          },
          {
            nameSingular: 'person',
            labelSingular: 'Person',
            tableName: 'person',
            columns: [{ name: 'id', isText: false }],
          },
        ],
        partNamesByTable: {
          company: ['company-00000.csv', 'company-00001.csv'],
        },
        rowCountByPart: { 'company-00000.csv': 1000, 'company-00001.csv': 7 },
        completedTableCount: 1,
        startedAt: 0,
        heartbeatAt: 0,
      }),
    ).toEqual({
      objectCount: 2,
      exportedObjectCount: 1,
      columnCount: 3,
      exportedRowCount: 1007,
    });
  });
});

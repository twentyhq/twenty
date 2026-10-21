import { buildWorkspaceDataExportObjects } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-objects.util';

describe('buildWorkspaceDataExportObjects', () => {
  it('reports columns, rows summed across parts, and export status per object', () => {
    expect(
      buildWorkspaceDataExportObjects({
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
          person: ['person-00000.csv'],
        },
        rowCountByPart: {
          'company-00000.csv': 1000,
          'company-00001.csv': 7,
          'person-00000.csv': 12,
        },
        completedTableCount: 1,
      }),
    ).toEqual([
      {
        nameSingular: 'company',
        labelSingular: 'Company',
        columnCount: 2,
        rowCount: 1007,
        isExported: true,
      },
      {
        nameSingular: 'person',
        labelSingular: 'Person',
        columnCount: 1,
        rowCount: 12,
        isExported: false,
      },
    ]);
  });
});

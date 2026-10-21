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
            fieldCount: 2,
            columns: [
              { name: 'id', isText: false },
              { name: 'name', isText: true },
              { name: 'addressCity', isText: true },
            ],
          },
          {
            nameSingular: 'person',
            labelSingular: 'Person',
            tableName: 'person',
            fieldCount: 1,
            columns: [{ name: 'id', isText: false }],
          },
        ],
        partsByTable: {
          company: [
            { name: 'company-00000.csv', recordCount: 1000 },
            { name: 'company-00001.csv', recordCount: 7 },
          ],
          person: [{ name: 'person-00000.csv', recordCount: 12 }],
        },
        completedTableCount: 1,
      }),
    ).toEqual([
      {
        nameSingular: 'company',
        labelSingular: 'Company',
        fieldCount: 2,
        recordCount: 1007,
        isExported: true,
      },
      {
        nameSingular: 'person',
        labelSingular: 'Person',
        fieldCount: 1,
        recordCount: 12,
        isExported: false,
      },
    ]);
  });
});

import { buildWorkspaceDataExportObjects } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-objects.util';

describe('buildWorkspaceDataExportObjects', () => {
  it('reports columns, rows summed across parts, and export status per object', () => {
    expect(
      buildWorkspaceDataExportObjects({
        tables: [
          {
            nameSingular: 'company',
            labelSingular: 'Company',
            objectMetadataId: 'company-object-id',
            fieldMetadataIds: ['id-field-id', 'name-field-id'],
            fieldCount: 2,
          },
          {
            nameSingular: 'person',
            labelSingular: 'Person',
            objectMetadataId: 'person-object-id',
            fieldMetadataIds: ['id-field-id'],
            fieldCount: 1,
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

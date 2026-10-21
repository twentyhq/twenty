import { buildWorkspaceDataExportFileNames } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-file-names.util';

describe('buildWorkspaceDataExportFileNames', () => {
  it('names a single part after the object', () => {
    expect(
      buildWorkspaceDataExportFileNames({
        nameSingular: 'company',
        partCount: 1,
      }),
    ).toEqual(['company.csv']);
  });

  it('numbers the files when an object spans several parts', () => {
    expect(
      buildWorkspaceDataExportFileNames({
        nameSingular: 'company',
        partCount: 3,
      }),
    ).toEqual(['company-1.csv', 'company-2.csv', 'company-3.csv']);
  });
});

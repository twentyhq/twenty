import { getWorkspaceDataExportSummary } from '@/settings/admin-panel/utils/getWorkspaceDataExportSummary';

describe('getWorkspaceDataExportSummary', () => {
  it('sums objects, columns and rows and counts exported objects', () => {
    expect(
      getWorkspaceDataExportSummary([
        { fieldCount: 12, recordCount: 599, isExported: true },
        { fieldCount: 30, recordCount: 1200, isExported: false },
      ]),
    ).toEqual({
      objectCount: 2,
      exportedObjectCount: 1,
      fieldCount: 42,
      recordCount: 1799,
    });
  });

  it('returns zeros for an export without objects', () => {
    expect(getWorkspaceDataExportSummary([])).toEqual({
      objectCount: 0,
      exportedObjectCount: 0,
      fieldCount: 0,
      recordCount: 0,
    });
  });
});

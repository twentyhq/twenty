import { getWorkspaceDataExportSummary } from '@/settings/admin-panel/utils/getWorkspaceDataExportSummary';

describe('getWorkspaceDataExportSummary', () => {
  it('sums objects, columns and rows and counts exported objects', () => {
    expect(
      getWorkspaceDataExportSummary([
        { columnCount: 12, rowCount: 599, isExported: true },
        { columnCount: 30, rowCount: 1200, isExported: false },
      ]),
    ).toEqual({
      objectCount: 2,
      exportedObjectCount: 1,
      columnCount: 42,
      rowCount: 1799,
    });
  });

  it('returns zeros for an export without objects', () => {
    expect(getWorkspaceDataExportSummary([])).toEqual({
      objectCount: 0,
      exportedObjectCount: 0,
      columnCount: 0,
      rowCount: 0,
    });
  });
});

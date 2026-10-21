import { buildNextWorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/utils/build-next-workspace-data-export-cursor.util';

const cursor = {
  tableIndex: 2,
  after: 'aaa',
  partIndex: 3,
  stepIndex: 7,
  attempt: 1,
};

describe('buildNextWorkspaceDataExportCursor', () => {
  it('moves to the next part of the same table when rows remain', () => {
    expect(
      buildNextWorkspaceDataExportCursor({
        cursor,
        after: 'bbb',
        isTableExhausted: false,
      }),
    ).toEqual({
      tableIndex: 2,
      after: 'bbb',
      partIndex: 4,
      stepIndex: 8,
      attempt: 0,
    });
  });

  it('moves to the first part of the next table once exhausted', () => {
    expect(
      buildNextWorkspaceDataExportCursor({
        cursor,
        after: 'bbb',
        isTableExhausted: true,
      }),
    ).toEqual({
      tableIndex: 3,
      after: null,
      partIndex: 0,
      stepIndex: 8,
      attempt: 0,
    });
  });
});

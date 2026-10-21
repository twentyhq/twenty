import { buildNextWorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/utils/build-next-workspace-data-export-cursor.util';

const cursor = {
  tableIndex: 2,
  lastId: 'aaa',
  partIndex: 3,
  stepIndex: 7,
  attempt: 1,
};

describe('buildNextWorkspaceDataExportCursor', () => {
  it('moves to the next part of the same table when rows remain', () => {
    expect(
      buildNextWorkspaceDataExportCursor({
        cursor,
        lastId: 'bbb',
        isTableExhausted: false,
      }),
    ).toEqual({
      tableIndex: 2,
      lastId: 'bbb',
      partIndex: 4,
      stepIndex: 8,
      attempt: 0,
    });
  });

  it('moves to the first part of the next table once exhausted', () => {
    expect(
      buildNextWorkspaceDataExportCursor({
        cursor,
        lastId: 'bbb',
        isTableExhausted: true,
      }),
    ).toEqual({
      tableIndex: 3,
      lastId: null,
      partIndex: 0,
      stepIndex: 8,
      attempt: 0,
    });
  });
});

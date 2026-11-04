import { buildNextWorkspaceDataExportCursor } from 'src/engine/core-modules/workspace-data-export/utils/build-next-workspace-data-export-cursor.util';

const cursor = {
  objectIndex: 2,
  after: 'aaa',
  partIndex: 3,
  stepIndex: 7,
  attempt: 1,
};

describe('buildNextWorkspaceDataExportCursor', () => {
  it('moves to the next part of the same object when records remain', () => {
    expect(
      buildNextWorkspaceDataExportCursor({
        cursor,
        after: 'bbb',
        isLastPart: false,
      }),
    ).toEqual({
      objectIndex: 2,
      after: 'bbb',
      partIndex: 4,
      stepIndex: 8,
      attempt: 0,
    });
  });

  it('moves to the first part of the next object once exhausted', () => {
    expect(
      buildNextWorkspaceDataExportCursor({
        cursor,
        after: 'bbb',
        isLastPart: true,
      }),
    ).toEqual({
      objectIndex: 3,
      after: null,
      partIndex: 0,
      stepIndex: 8,
      attempt: 0,
    });
  });
});

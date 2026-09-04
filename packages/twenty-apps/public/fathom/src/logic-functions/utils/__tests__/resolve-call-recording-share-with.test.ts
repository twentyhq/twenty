import { describe, expect, it } from 'vitest';

import { resolveCallRecordingShareWith } from 'src/logic-functions/utils/resolve-call-recording-share-with.util';

describe('resolveCallRecordingShareWith', () => {
  it('gives the owning workspace member full access for a personal connection', () => {
    expect(
      resolveCallRecordingShareWith({
        visibility: 'user',
        workspaceMemberId: 'workspace-member-1',
      }),
    ).toEqual([
      { workspaceMemberId: 'workspace-member-1', accessLevel: 'FULL' },
    ]);
  });

  it('gives everyone read access for a workspace connection', () => {
    expect(
      resolveCallRecordingShareWith({
        visibility: 'workspace',
        workspaceMemberId: 'workspace-member-1',
      }),
    ).toEqual([{ everyone: true, accessLevel: 'READ' }]);
  });

  it('gives everyone read access when the connecting member has left the workspace', () => {
    expect(
      resolveCallRecordingShareWith({
        visibility: 'user',
        workspaceMemberId: null,
      }),
    ).toEqual([{ everyone: true, accessLevel: 'READ' }]);
  });
});

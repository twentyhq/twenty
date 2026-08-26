import { getWorkspaceIdFromJobData } from 'src/engine/core-modules/message-queue/utils/get-workspace-id-from-job-data.util';

describe('getWorkspaceIdFromJobData', () => {
  it('returns the workspaceId when present as a non-empty string', () => {
    expect(
      getWorkspaceIdFromJobData({ workspaceId: 'workspace-id', foo: 'bar' }),
    ).toBe('workspace-id');
  });

  it('returns undefined when workspaceId is missing', () => {
    expect(getWorkspaceIdFromJobData({ foo: 'bar' })).toBeUndefined();
  });

  it('returns undefined when workspaceId is an empty string', () => {
    expect(getWorkspaceIdFromJobData({ workspaceId: '' })).toBeUndefined();
  });

  it('returns undefined when workspaceId is not a string', () => {
    expect(getWorkspaceIdFromJobData({ workspaceId: 42 })).toBeUndefined();
  });

  it.each([undefined, null, 'string', 42])(
    'returns undefined for non-object job data %p',
    (jobData) => {
      expect(getWorkspaceIdFromJobData(jobData)).toBeUndefined();
    },
  );
});

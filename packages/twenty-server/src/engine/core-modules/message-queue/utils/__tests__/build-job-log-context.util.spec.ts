import { buildJobLogContext } from 'src/engine/core-modules/message-queue/utils/build-job-log-context.util';

describe('buildJobLogContext', () => {
  it('lists workspace, application and queue wait as key=value pairs', () => {
    expect(
      buildJobLogContext({
        jobData: {
          workspaceId: 'ws-1',
          applicationUniversalIdentifier: 'app-1',
        },
        queueWaitMs: 1_200,
      }),
    ).toBe(' [workspace=ws-1 application=app-1 queueWaitMs=1200]');
  });

  it('keeps a zero queue wait', () => {
    expect(
      buildJobLogContext({ jobData: { workspaceId: 'ws-1' }, queueWaitMs: 0 }),
    ).toBe(' [workspace=ws-1 queueWaitMs=0]');
  });

  it('skips fields that are missing or not strings', () => {
    expect(
      buildJobLogContext({
        jobData: { workspaceId: 42, applicationUniversalIdentifier: '' },
      }),
    ).toBe('');
  });

  it('handles job data that is not an object', () => {
    expect(buildJobLogContext({ jobData: [{ workspaceId: 'ws-1' }] })).toBe('');
  });
});

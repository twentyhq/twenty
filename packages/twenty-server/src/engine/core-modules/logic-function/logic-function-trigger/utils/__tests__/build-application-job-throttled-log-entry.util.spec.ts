import { buildApplicationJobThrottledLogEntry } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-application-job-throttled-log-entry.util';

describe('buildApplicationJobThrottledLogEntry', () => {
  it('records the throttled application without a skipped count', () => {
    const entry = buildApplicationJobThrottledLogEntry({
      workspaceId: 'workspace-1',
      application: {
        id: 'application-1',
        applicationRegistrationId: 'registration-1',
        version: '1.2.3',
      },
    });

    expect(entry).toMatchObject({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      applicationRegistrationId: 'registration-1',
      applicationVersion: '1.2.3',
      source: 'JOB_RATE_LIMIT',
      level: 'WARN',
      message:
        'Job enqueue limit reached. Logic function triggers were skipped.',
      errorCode: 'LIMIT_REACHED',
    });
    expect(entry.properties).toBeUndefined();
  });
});

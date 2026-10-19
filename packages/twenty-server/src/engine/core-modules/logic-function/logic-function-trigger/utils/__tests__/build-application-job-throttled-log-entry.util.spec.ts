import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildApplicationJobThrottledLogEntry } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-application-job-throttled-log-entry.util';

describe('buildApplicationJobThrottledLogEntry', () => {
  it('records how many triggers were skipped', () => {
    expect(
      buildApplicationJobThrottledLogEntry({
        workspaceId: 'workspace-1',
        application: {
          id: 'application-1',
          applicationRegistrationId: 'registration-1',
          version: '1.2.3',
        } as FlatApplication,
        skippedJobCount: 3,
      }),
    ).toMatchObject({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      applicationRegistrationId: 'registration-1',
      applicationVersion: '1.2.3',
      source: 'JOB_RATE_LIMIT',
      level: 'WARN',
      message:
        'Job enqueue limit reached. Skipped 3 logic function trigger(s).',
      errorCode: 'LIMIT_REACHED',
      properties: { skippedJobCount: 3 },
    });
  });
});

import { buildApplicationJobTooLargeLogEntry } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-application-job-too-large-log-entry.util';
import { JobTooLargeException } from 'src/engine/core-modules/message-queue/exceptions/job-too-large.exception';

describe('buildApplicationJobTooLargeLogEntry', () => {
  it('records the skipped trigger with the job size and the limit', () => {
    const entry = buildApplicationJobTooLargeLogEntry({
      workspaceId: 'workspace-1',
      application: {
        id: 'application-1',
        applicationRegistrationId: 'registration-1',
        version: '1.2.3',
      },
      logicFunctionId: 'logic-function-1',
      error: new JobTooLargeException({
        index: 0,
        sizeBytes: 2_000_000,
        maxBytes: 1_048_576,
      }),
    });

    expect(entry).toMatchObject({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      applicationRegistrationId: 'registration-1',
      applicationVersion: '1.2.3',
      logicFunctionId: 'logic-function-1',
      source: 'LOGIC_FUNCTION',
      level: 'ERROR',
      errorCode: 'JOB_TOO_LARGE',
      properties: { sizeBytes: 2_000_000, maxBytes: 1_048_576 },
    });
  });
});

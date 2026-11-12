import { buildApplicationJobMemoryLimitLogEntry } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-application-job-memory-limit-log-entry.util';
import {
  MessageQueueException,
  MessageQueueExceptionCode,
} from 'src/engine/core-modules/message-queue/message-queue.exception';

describe('buildApplicationJobMemoryLimitLogEntry', () => {
  it('records the refused application with the refusal code', () => {
    const entry = buildApplicationJobMemoryLimitLogEntry({
      workspaceId: 'workspace-1',
      application: {
        id: 'application-1',
        applicationRegistrationId: 'registration-1',
        version: '1.2.3',
      },
      exception: new MessageQueueException(
        'Job 0 is too large',
        MessageQueueExceptionCode.JOB_TOO_LARGE,
        { index: 0, sizeBytes: 2_000_000, maxBytes: 1_048_576 },
      ),
    });

    expect(entry).toMatchObject({
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      applicationRegistrationId: 'registration-1',
      applicationVersion: '1.2.3',
      source: 'JOB_RATE_LIMIT',
      level: 'WARN',
      message:
        'Job queue memory limit reached (Job 0 is too large). Logic function triggers were skipped.',
      errorCode: 'JOB_TOO_LARGE',
    });
  });
});

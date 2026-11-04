import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { buildApplicationPlatformLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-platform-log-entry';
import {
  type JobTooLargeException,
  JobTooLargeExceptionCode,
} from 'src/engine/core-modules/message-queue/exceptions/job-too-large.exception';

export const buildApplicationJobTooLargeLogEntry = ({
  workspaceId,
  application,
  logicFunctionId,
  error,
}: {
  workspaceId: string;
  application: Pick<
    FlatApplication,
    'id' | 'applicationRegistrationId' | 'version'
  >;
  logicFunctionId?: string;
  error: JobTooLargeException;
}): ApplicationLogEntry =>
  buildApplicationPlatformLogEntry({
    workspaceId,
    applicationId: application.id,
    applicationRegistrationId: application.applicationRegistrationId ?? '',
    applicationVersion: application.version ?? '',
    logicFunctionId,
    source: 'LOGIC_FUNCTION',
    level: 'ERROR',
    message: `Job too large: ${error.details.sizeBytes} bytes, over the ${error.details.maxBytes} bytes limit. Logic function triggers were skipped.`,
    errorCode: JobTooLargeExceptionCode.JOB_TOO_LARGE,
    properties: {
      sizeBytes: error.details.sizeBytes,
      maxBytes: error.details.maxBytes,
    },
  });

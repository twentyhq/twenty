import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { buildApplicationPlatformLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-platform-log-entry';
import { type MessageQueueException } from 'src/engine/core-modules/message-queue/message-queue.exception';

export const buildApplicationJobMemoryLimitLogEntry = ({
  workspaceId,
  application,
  exception,
}: {
  workspaceId: string;
  application: Pick<
    FlatApplication,
    'id' | 'applicationRegistrationId' | 'version'
  >;
  exception: MessageQueueException;
}): ApplicationLogEntry =>
  buildApplicationPlatformLogEntry({
    workspaceId,
    applicationId: application.id,
    applicationRegistrationId: application.applicationRegistrationId ?? '',
    applicationVersion: application.version ?? '',
    source: 'JOB_RATE_LIMIT',
    level: 'WARN',
    message: `Job queue memory limit reached (${exception.message}). Logic function triggers were skipped.`,
    errorCode: exception.code,
  });

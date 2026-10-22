import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { buildApplicationPlatformLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-platform-log-entry';
import { ThrottlerExceptionCode } from 'src/engine/core-modules/throttler/throttler.exception';

export const buildApplicationJobThrottledLogEntry = ({
  workspaceId,
  application,
}: {
  workspaceId: string;
  application: Pick<
    FlatApplication,
    'id' | 'applicationRegistrationId' | 'version'
  >;
}): ApplicationLogEntry =>
  buildApplicationPlatformLogEntry({
    workspaceId,
    applicationId: application.id,
    applicationRegistrationId: application.applicationRegistrationId ?? '',
    applicationVersion: application.version ?? '',
    source: 'JOB_RATE_LIMIT',
    level: 'WARN',
    message: 'Job enqueue limit reached. Logic function triggers were skipped.',
    errorCode: ThrottlerExceptionCode.LIMIT_REACHED,
  });

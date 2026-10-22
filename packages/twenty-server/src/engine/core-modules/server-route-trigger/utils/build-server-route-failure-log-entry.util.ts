import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { isUsageRefusedError } from 'src/engine/core-modules/billing/utils/is-usage-refused-error.util';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { buildApplicationPlatformLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-platform-log-entry';
import { ServerRouteTriggerException } from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

export const buildServerRouteFailureLogEntry = ({
  resolver,
  applicationRegistrationId,
  error,
}: {
  resolver: Pick<
    LogicFunctionEntity,
    'id' | 'name' | 'workspaceId' | 'applicationId'
  > & { application?: Pick<ApplicationEntity, 'version'> };
  applicationRegistrationId: string;
  error: unknown;
}): ApplicationLogEntry =>
  buildApplicationPlatformLogEntry({
    workspaceId: resolver.workspaceId,
    applicationId: resolver.applicationId,
    applicationRegistrationId,
    applicationVersion: resolver.application?.version ?? '',
    source: 'SERVER_ROUTE',
    logicFunctionId: resolver.id,
    logicFunctionName: resolver.name,
    level: 'ERROR',
    message: `Server route request failed: ${error instanceof Error ? error.message : String(error)}`,
    errorCode:
      error instanceof ServerRouteTriggerException || isUsageRefusedError(error)
        ? error.code
        : 'UNKNOWN',
  });

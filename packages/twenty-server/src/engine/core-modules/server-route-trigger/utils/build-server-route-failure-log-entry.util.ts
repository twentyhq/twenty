import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { ServerRouteTriggerException } from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

export const buildServerRouteFailureLogEntry = ({
  resolver,
  applicationRegistrationId,
  error,
}: {
  resolver: LogicFunctionEntity;
  applicationRegistrationId: string;
  error: unknown;
}): ApplicationLogEntry => ({
  timestamp: new Date(),
  workspaceId: resolver.workspaceId,
  applicationId: resolver.applicationId,
  applicationRegistrationId,
  applicationVersion: resolver.application?.version ?? '',
  source: 'SERVER_ROUTE',
  logicFunctionId: resolver.id,
  logicFunctionName: resolver.name,
  executionId: '',
  level: 'ERROR',
  message: `Server route request failed: ${error instanceof Error ? error.message : String(error)}`,
  errorCode:
    error instanceof ServerRouteTriggerException ? error.code : 'UNKNOWN',
});

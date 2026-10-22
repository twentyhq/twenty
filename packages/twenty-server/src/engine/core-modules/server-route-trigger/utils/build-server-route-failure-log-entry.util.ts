import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { buildApplicationPlatformLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-platform-log-entry';
import { ServerRouteTriggerExceptionCode } from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { isAppFacingServerRouteError } from 'src/engine/core-modules/server-route-trigger/utils/is-app-facing-server-route-error.util';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const getServerRouteFailureDetails = (
  error: unknown,
): Pick<ApplicationLogEntry, 'message' | 'errorCode'> => {
  if (isAppFacingServerRouteError(error)) {
    return {
      message: `Server route request failed: ${error.message}`,
      errorCode: error.code,
    };
  }

  return {
    message: 'Server route request failed because of a platform error.',
    errorCode: ServerRouteTriggerExceptionCode.SERVER_ROUTE_PLATFORM_ERROR,
  };
};

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
    ...getServerRouteFailureDetails(error),
  });

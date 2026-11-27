import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { ServerRouteTriggerExceptionCode } from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { type ServerRouteLogResolver } from 'src/engine/core-modules/server-route-trigger/types/server-route-log-resolver.type';
import { buildServerRouteLogEntry } from 'src/engine/core-modules/server-route-trigger/utils/build-server-route-log-entry.util';
import { isAppFacingServerRouteError } from 'src/engine/core-modules/server-route-trigger/utils/is-app-facing-server-route-error.util';

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
  resolver: ServerRouteLogResolver;
  applicationRegistrationId: string;
  error: unknown;
}): ApplicationLogEntry =>
  buildServerRouteLogEntry({
    resolver,
    applicationRegistrationId,
    level: 'ERROR',
    ...getServerRouteFailureDetails(error),
  });

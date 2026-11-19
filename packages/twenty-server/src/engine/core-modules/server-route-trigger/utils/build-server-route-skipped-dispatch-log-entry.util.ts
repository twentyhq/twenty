import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { SERVER_ROUTE_APPLICATION_NOT_INSTALLED_REASON } from 'src/engine/core-modules/server-route-trigger/constants/server-route-application-not-installed-reason.constant';
import { type ServerRouteLogResolver } from 'src/engine/core-modules/server-route-trigger/types/server-route-log-resolver.type';
import { buildServerRouteLogEntry } from 'src/engine/core-modules/server-route-trigger/utils/build-server-route-log-entry.util';

export const buildServerRouteSkippedDispatchLogEntry = ({
  resolver,
  applicationRegistrationId,
}: {
  resolver: ServerRouteLogResolver;
  applicationRegistrationId: string;
}): ApplicationLogEntry =>
  buildServerRouteLogEntry({
    resolver,
    applicationRegistrationId,
    level: 'WARN',
    message:
      'Server route event skipped: the application is not installed in the workspace the resolver routed it to.',
    errorCode: SERVER_ROUTE_APPLICATION_NOT_INSTALLED_REASON,
  });

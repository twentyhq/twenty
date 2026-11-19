import { type ApplicationLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/application-log-entry.interface';
import { buildApplicationPlatformLogEntry } from 'src/engine/core-modules/event-logs/producers/application-log/build-application-platform-log-entry';
import { type ServerRouteLogResolver } from 'src/engine/core-modules/server-route-trigger/types/server-route-log-resolver.type';

export const buildServerRouteLogEntry = ({
  resolver,
  applicationRegistrationId,
  level,
  message,
  errorCode,
}: {
  resolver: ServerRouteLogResolver;
  applicationRegistrationId: string;
} & Pick<
  ApplicationLogEntry,
  'level' | 'message' | 'errorCode'
>): ApplicationLogEntry =>
  buildApplicationPlatformLogEntry({
    workspaceId: resolver.workspaceId,
    applicationId: resolver.applicationId,
    applicationRegistrationId,
    applicationVersion: resolver.application?.version ?? '',
    source: 'SERVER_ROUTE',
    logicFunctionId: resolver.id,
    logicFunctionName: resolver.name,
    level,
    message,
    errorCode,
  });

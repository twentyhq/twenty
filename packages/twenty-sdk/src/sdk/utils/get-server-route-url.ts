import { isNonEmptyString, isObject } from '@sniptt/guards';
import {
  DEFAULT_API_URL_NAME,
  DEFAULT_SERVER_ROUTE_IDS_NAME,
} from 'twenty-shared/application-runtime';

export const getServerRouteUrl = (
  logicFunctionUniversalIdentifier: string,
): string => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const serverRouteIds = process.env[DEFAULT_SERVER_ROUTE_IDS_NAME];

  if (!isNonEmptyString(apiUrl) || !isNonEmptyString(serverRouteIds)) {
    throw new Error(
      'getServerRouteUrl can only be called from within a logic function of an app that declares server routes',
    );
  }

  const parsedServerRouteIds: unknown = JSON.parse(serverRouteIds);
  const logicFunctionId: unknown = isObject(parsedServerRouteIds)
    ? Reflect.get(parsedServerRouteIds, logicFunctionUniversalIdentifier)
    : undefined;

  if (!isNonEmptyString(logicFunctionId)) {
    throw new Error(
      `No server route found for logic function ${logicFunctionUniversalIdentifier}`,
    );
  }

  return `${apiUrl.replace(/\/+$/, '')}/webhooks/server/${logicFunctionId}`;
};

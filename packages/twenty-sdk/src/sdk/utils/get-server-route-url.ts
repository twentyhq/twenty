import {
  DEFAULT_API_URL_NAME,
  DEFAULT_SERVER_ROUTE_IDS_NAME,
} from 'twenty-shared/application-runtime';

// Public URL of one of the app's server routes, for registering with a
// webhook provider. Server routes are reached by the logic function id the
// server assigned in the app owner's workspace, not by its universalIdentifier.
export const getServerRouteUrl = (
  logicFunctionUniversalIdentifier: string,
): string => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const serverRouteIds = process.env[DEFAULT_SERVER_ROUTE_IDS_NAME];

  if (!apiUrl || !serverRouteIds) {
    throw new Error(
      'getServerRouteUrl can only be called from within a logic function of an app that declares server routes',
    );
  }

  const logicFunctionId = (
    JSON.parse(serverRouteIds) as Record<string, string>
  )[logicFunctionUniversalIdentifier];

  if (!logicFunctionId) {
    throw new Error(
      `No server route found for logic function ${logicFunctionUniversalIdentifier}`,
    );
  }

  return `${apiUrl.replace(/\/+$/, '')}/webhooks/server/${logicFunctionId}`;
};

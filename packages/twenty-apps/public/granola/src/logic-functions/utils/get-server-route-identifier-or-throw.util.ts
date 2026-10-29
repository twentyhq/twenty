import { isNonEmptyString, isObject } from '@sniptt/guards';

// TODO(@charlesBochet): delete once the app's twenty-sdk ships getServerRouteUrl.
export const getServerRouteIdentifierOrThrow = (
  logicFunctionUniversalIdentifier: string,
): string => {
  const serverRouteIds = process.env.TWENTY_SERVER_ROUTE_IDS;

  if (!isNonEmptyString(serverRouteIds)) {
    return logicFunctionUniversalIdentifier;
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

  return logicFunctionId;
};

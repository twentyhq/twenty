// Servers that predate TWENTY_SERVER_ROUTE_IDS still route by universalIdentifier.
export const getServerRouteIdentifier = (
  logicFunctionUniversalIdentifier: string,
): string => {
  const serverRouteIds = process.env.TWENTY_SERVER_ROUTE_IDS;

  if (!serverRouteIds) {
    return logicFunctionUniversalIdentifier;
  }

  return (
    (JSON.parse(serverRouteIds) as Record<string, string>)[
      logicFunctionUniversalIdentifier
    ] ?? logicFunctionUniversalIdentifier
  );
};

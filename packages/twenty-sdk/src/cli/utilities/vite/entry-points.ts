export const extractFunctionEntryPoints = (
  serverlessFunctions: Array<{ handlerPath: string }>,
): string[] => {
  return serverlessFunctions.map((fn) => fn.handlerPath).sort();
};

export const haveFunctionEntryPointsChanged = (
  currentEntryPoints: string[],
  newEntryPoints: string[],
): boolean => {
  if (currentEntryPoints.length !== newEntryPoints.length) {
    return true;
  }

  return newEntryPoints.some(
    (entryPoint, index) => entryPoint !== currentEntryPoints[index],
  );
};

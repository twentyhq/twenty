export const extractFunctionEntryPoints = (
  serverlessFunctions: Array<{ handlerPath: string }>,
): string[] => {
  return serverlessFunctions.map((fn) => fn.handlerPath).sort();
};

export const extractFrontComponentEntryPoints = (
  frontComponents: Array<{ componentPath: string }> | undefined,
): string[] => {
  if (!frontComponents) {
    return [];
  }
  return frontComponents.map((component) => component.componentPath).sort();
};

export const haveEntryPointsChanged = (
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

export const haveFunctionEntryPointsChanged = haveEntryPointsChanged;

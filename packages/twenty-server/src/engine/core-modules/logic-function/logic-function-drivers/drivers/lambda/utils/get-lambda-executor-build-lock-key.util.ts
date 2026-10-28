export const getLambdaExecutorBuildLockKey = (
  logicFunctionId: string,
): string => `lambda-build:${logicFunctionId}`;

export const setWorkerEnv = (environmentVariables: Record<string, string>) => {
  const globalObject = globalThis as Record<string, unknown>;
  const processObject =
    (globalObject['process'] as Record<string, unknown> | undefined) ?? {};
  const processEnvironment =
    (processObject['env'] as Record<string, string> | undefined) ?? {};

  processObject['env'] = {
    ...processEnvironment,
    ...environmentVariables,
  };

  globalObject['process'] = processObject;
};

import { runTwenty } from './run-twenty';

export const readManifestLogicFunctionNames = async (): Promise<string[]> => {
  const result = await runTwenty(['app', 'build']);
  if (!result.ok) throw new Error(`App build failed: ${result.error.message}`);
  const { manifest } = result.data as {
    manifest: { logicFunctions: { name: string }[] };
  };
  return manifest.logicFunctions.map((logicFunction) => logicFunction.name);
};

import { z } from 'zod';

import { runTwenty } from './run-twenty';

const buildResultSchema = z.object({
  manifest: z.object({
    logicFunctions: z.array(z.object({ name: z.string() })),
  }),
});

export const readManifestLogicFunctionNamesOrThrow = async (): Promise<
  string[]
> => {
  const result = await runTwenty(['app', 'build']);

  if (!result.ok) {
    throw new Error(`App build failed: ${JSON.stringify(result.error)}`);
  }

  const { manifest } = buildResultSchema.parse(result.data);

  return manifest.logicFunctions.map((logicFunction) => logicFunction.name);
};

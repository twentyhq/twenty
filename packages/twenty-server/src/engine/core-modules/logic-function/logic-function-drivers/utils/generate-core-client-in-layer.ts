import { join } from 'path';

import { generateCoreClientFromSchema } from 'twenty-sdk/cli';

const CLIENTS_GENERATED_DIR = 'src/clients/generated';

export const generateCoreClientInLayer = async ({
  layerPath,
  schema,
}: {
  layerPath: string;
  schema: string;
}): Promise<void> => {
  const coreOutputPath = join(
    layerPath,
    'node_modules',
    'twenty-sdk',
    CLIENTS_GENERATED_DIR,
    'core',
  );

  await generateCoreClientFromSchema({
    schema,
    outputPath: coreOutputPath,
  });
};

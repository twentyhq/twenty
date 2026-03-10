import { join } from 'node:path';

import { replaceCoreClient } from 'twenty-client-sdk/generate';

export const generateCoreClientInLayer = async ({
  layerPath,
  schema,
}: {
  layerPath: string;
  schema: string;
}): Promise<void> => {
  await replaceCoreClient({
    packageRoot: join(layerPath, 'node_modules', 'twenty-client-sdk'),
    schema,
  });
};

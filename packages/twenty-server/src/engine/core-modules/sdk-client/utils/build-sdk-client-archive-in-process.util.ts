import { promises as fs } from 'fs';
import { join } from 'path';

import { replaceCoreClient } from 'twenty-client-sdk/generate';

import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';
import { TemporaryDirManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/temporary-dir-manager';
import { copySdkClientPackageTemplate } from 'src/engine/core-modules/sdk-client/utils/copy-sdk-client-package-template.util';

export const buildSdkClientArchiveInProcess = async ({
  schema,
}: {
  schema: string;
}): Promise<Buffer> => {
  const temporaryDirManager = new TemporaryDirManager();

  try {
    const { sourceTemporaryDir } = await temporaryDirManager.init();
    const packageRoot = join(sourceTemporaryDir, 'twenty-client-sdk');
    const archivePath = join(sourceTemporaryDir, 'twenty-client-sdk.zip');

    await copySdkClientPackageTemplate(packageRoot);
    await replaceCoreClient({ packageRoot, schema });
    await createZipFile(packageRoot, archivePath);

    return await fs.readFile(archivePath);
  } finally {
    await temporaryDirManager.clean();
  }
};

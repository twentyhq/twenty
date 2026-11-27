import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

import { SDK_CLIENT_PACKAGE_DIRNAME } from 'src/engine/core-modules/sdk-client/constants/sdk-client-package-dirname';
import { isSdkClientPackageTemplatePath } from 'src/engine/core-modules/sdk-client/utils/copy-sdk-client-package-template.util';

export const computeSdkClientPackageTemplateFingerprint =
  async (): Promise<string> => {
    const entries = await fs.readdir(SDK_CLIENT_PACKAGE_DIRNAME, {
      recursive: true,
      withFileTypes: true,
    });

    const filePaths = entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(entry.parentPath, entry.name))
      .filter(isSdkClientPackageTemplatePath)
      .sort();

    const hash = createHash('sha256');

    for (const filePath of filePaths) {
      hash.update(path.relative(SDK_CLIENT_PACKAGE_DIRNAME, filePath));
      hash.update(await fs.readFile(filePath));
    }

    return hash.digest('hex');
  };

import { readFile } from 'node:fs/promises';
import { glob } from 'tinyglobby';

import {
  extractDefineEntity,
  TargetFunction,
} from '@/cli/utilities/build/manifest/manifest-extract-config';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file';

type ApplicationConfigWithUniversalIdentifier = {
  universalIdentifier?: string;
};

// Best-effort lookup of the application universal identifier from the app
// sources, used by scaffolding commands that need to embed it in generated
// files. Returns undefined when no defineApplication() file can be resolved.
export const getApplicationUniversalIdentifier = async (
  appPath: string,
): Promise<string | undefined> => {
  const filePaths = await glob(['**/*.ts', '**/*.tsx'], {
    cwd: appPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**', '**/.twenty/**'],
    onlyFiles: true,
  });

  for (const filePath of filePaths) {
    const fileContent = await readFile(filePath, 'utf-8');

    if (extractDefineEntity(fileContent) !== TargetFunction.DefineApplication) {
      continue;
    }

    try {
      const extract =
        await extractManifestFromFile<ApplicationConfigWithUniversalIdentifier>(
          {
            appPath,
            filePath,
          },
        );

      if (extract.config?.universalIdentifier) {
        return extract.config.universalIdentifier;
      }
    } catch {
      // Ignore files that fail to compile; scaffolding should not crash on them
    }
  }

  return undefined;
};

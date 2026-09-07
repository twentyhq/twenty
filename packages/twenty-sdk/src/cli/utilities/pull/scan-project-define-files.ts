import {
  TARGET_FUNCTION_TO_ENTITY_KEY_MAPPING,
  extractDefineEntity,
  type ManifestEntityKey,
} from '@/cli/utilities/build/manifest/manifest-extract-config';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file';
import { glob } from 'tinyglobby';
import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { isDefined } from 'twenty-shared/utils';

export type ScannedDefineFile = {
  relativePath: string;
  entityKey: ManifestEntityKey | null;
  universalIdentifier: string | null;
  isReadable: boolean;
};

type ExtractedConfig = {
  universalIdentifier?: unknown;
};

export const scanProjectDefineFiles = async (
  appPath: string,
): Promise<ScannedDefineFile[]> => {
  const filePaths = await glob(['**/*.ts', '**/*.tsx'], {
    cwd: appPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**', '**/.twenty/**'],
    onlyFiles: true,
  });

  const scannedFiles: ScannedDefineFile[] = [];

  for (const filePath of filePaths) {
    const relativePath = relative(appPath, filePath);

    let fileContent: string;

    try {
      fileContent = await readFile(filePath, 'utf-8');
    } catch {
      scannedFiles.push({
        relativePath,
        entityKey: null,
        universalIdentifier: null,
        isReadable: false,
      });
      continue;
    }

    const targetFunctionName = extractDefineEntity(fileContent);

    if (!isDefined(targetFunctionName)) {
      continue;
    }

    const entityKey = TARGET_FUNCTION_TO_ENTITY_KEY_MAPPING[targetFunctionName];

    let config: ExtractedConfig = {};
    let isReadable = true;

    try {
      const extract = await extractManifestFromFile<ExtractedConfig>({
        appPath,
        filePath,
      });

      config = extract.config ?? {};
    } catch {
      config = {};
      isReadable = false;
    }

    scannedFiles.push({
      relativePath,
      entityKey,
      universalIdentifier:
        typeof config.universalIdentifier === 'string'
          ? config.universalIdentifier
          : null,
      isReadable,
    });
  }

  return scannedFiles;
};

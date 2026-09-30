import {
  TARGET_FUNCTION_TO_ENTITY_KEY_MAPPING,
  extractDefineEntity,
  type ManifestEntityKey,
  type TargetFunction,
} from '@/cli/utilities/build/manifest/manifest-extract-config';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file';
import {
  APPLICATION_SOURCE_GLOBS,
  APPLICATION_SOURCE_IGNORED_GLOBS,
} from '@/cli/utilities/file/application-source-globs';
import { glob } from 'tinyglobby';
import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { isDefined } from 'twenty-shared/utils';

export type ScannedSourceFile = {
  relativePath: string;
  entityKey: ManifestEntityKey | null;
  targetFunctionName: TargetFunction | null;
  universalIdentifier: string | null;
  isReadable: boolean;
  config?: unknown;
};

type ExtractedConfig = {
  universalIdentifier?: unknown;
};

export const scanProjectSourceFiles = async ({
  appPath,
  includeConfig = false,
}: {
  appPath: string;
  includeConfig?: boolean;
}): Promise<ScannedSourceFile[]> => {
  const filePaths = await glob(APPLICATION_SOURCE_GLOBS, {
    cwd: appPath,
    absolute: true,
    ignore: APPLICATION_SOURCE_IGNORED_GLOBS,
    onlyFiles: true,
  });

  const scannedFiles: ScannedSourceFile[] = [];

  for (const filePath of filePaths) {
    const relativePath = relative(appPath, filePath);

    let fileContent: string;

    try {
      fileContent = await readFile(filePath, 'utf-8');
    } catch {
      scannedFiles.push({
        relativePath,
        entityKey: null,
        targetFunctionName: null,
        universalIdentifier: null,
        isReadable: false,
      });
      continue;
    }

    const targetFunctionName = extractDefineEntity(fileContent);

    if (!isDefined(targetFunctionName)) {
      scannedFiles.push({
        relativePath,
        entityKey: null,
        targetFunctionName: null,
        universalIdentifier: null,
        isReadable: true,
      });
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
      targetFunctionName,
      universalIdentifier:
        typeof config.universalIdentifier === 'string'
          ? config.universalIdentifier
          : null,
      isReadable,
      ...(includeConfig ? { config } : {}),
    });
  }

  return scannedFiles;
};

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
  entityKey: ManifestEntityKey;
  universalIdentifier: string | null;
  childUniversalIdentifiers: string[];
};

type ExtractedConfig = {
  universalIdentifier?: unknown;
  fields?: { universalIdentifier?: unknown }[];
};

const readChildUniversalIdentifiers = (config: ExtractedConfig): string[] =>
  (Array.isArray(config.fields) ? config.fields : [])
    .map((field) => field?.universalIdentifier)
    .filter(
      (identifier): identifier is string => typeof identifier === 'string',
    );

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
    const fileContent = await readFile(filePath, 'utf-8');
    const targetFunctionName = extractDefineEntity(fileContent);

    if (!isDefined(targetFunctionName)) {
      continue;
    }

    const entityKey = TARGET_FUNCTION_TO_ENTITY_KEY_MAPPING[targetFunctionName];

    let config: ExtractedConfig = {};

    try {
      const extract = await extractManifestFromFile<ExtractedConfig>({
        appPath,
        filePath,
      });

      config = extract.config ?? {};
    } catch {
      config = {};
    }

    scannedFiles.push({
      relativePath: relative(appPath, filePath),
      entityKey,
      universalIdentifier:
        typeof config.universalIdentifier === 'string'
          ? config.universalIdentifier
          : null,
      childUniversalIdentifiers: readChildUniversalIdentifiers(config),
    });
  }

  return scannedFiles;
};

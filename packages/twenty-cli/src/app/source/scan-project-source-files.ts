import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';

import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  DEFINE_ENTITY_KEYS,
  extractDefineEntity,
  type ManifestEntityKey,
  type TargetFunction,
} from '@/app/source/extract-define-entity';
import { extractManifestFromFile } from '@/app/source/extract-manifest-from-file';
import { listApplicationSourceFiles } from '@/app/source/list-application-source-files';
import { CliError } from '@/output/cli-error';

export type ScannedSourceFile = {
  relativePath: string;
  entityKey: ManifestEntityKey | null;
  targetFunctionName: TargetFunction | null;
  universalIdentifier: string | null;
  isReadable: boolean;
  config?: unknown;
};

export const scanProjectSourceFiles = async ({
  appPath,
  includeConfig = false,
  signal,
}: {
  appPath: string;
  includeConfig?: boolean;
  signal: AbortSignal;
}): Promise<ScannedSourceFile[]> => {
  signal.throwIfAborted();

  const filePaths = await listApplicationSourceFiles(appPath);

  const scannedFiles: ScannedSourceFile[] = [];

  for (const filePath of filePaths) {
    signal.throwIfAborted();
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

    const entityKey = DEFINE_ENTITY_KEYS[targetFunctionName];

    let config: Record<string, unknown> = {};
    let isReadable = true;

    try {
      const extract = await extractManifestFromFile({
        appPath,
        filePath,
      });

      config = extract.config;
    } catch (error) {
      if (
        error instanceof CliError &&
        error.code === 'SDK_SOURCE_UNSUPPORTED'
      ) {
        throw error;
      }

      config = {};
      isReadable = false;
    }

    scannedFiles.push({
      relativePath,
      entityKey,
      targetFunctionName,
      universalIdentifier: isString(config.universalIdentifier)
        ? config.universalIdentifier
        : null,
      isReadable,
      ...(includeConfig ? { config } : {}),
    });
  }

  signal.throwIfAborted();

  return scannedFiles;
};

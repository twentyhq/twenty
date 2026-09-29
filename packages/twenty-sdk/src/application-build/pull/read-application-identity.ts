import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { isString } from '@sniptt/guards';
import { glob } from 'tinyglobby';
import { isDefined, isPlainObject, isValidUuid } from 'twenty-shared/utils';

import { type ReadAppIdentityResult } from '@/application-build/pull/types';
import {
  type BuildOperationOptions,
  type BuildResult,
} from '@/application-build/types';
import { validateAppPath } from '@/application-build/validate-app-path';
import {
  extractDefineEntity,
  TargetFunction,
} from '@/cli/utilities/build/manifest/manifest-extract-config';
import { extractManifestFromFile } from '@/cli/utilities/build/manifest/manifest-extract-config-from-file';

export const readApplicationIdentity = async ({
  appPath,
  signal,
}: BuildOperationOptions): Promise<BuildResult<ReadAppIdentityResult>> => {
  const validation = await validateAppPath(appPath);

  if (!validation.success) {
    return validation;
  }

  try {
    signal?.throwIfAborted();
    const filePaths = await glob(['**/*.ts', '**/*.tsx'], {
      cwd: appPath,
      absolute: true,
      ignore: [
        '**/node_modules/**',
        '**/*.d.ts',
        '**/dist/**',
        '**/.twenty/**',
      ],
      onlyFiles: true,
    });
    let application: ReadAppIdentityResult['application'] = null;

    for (const filePath of filePaths) {
      signal?.throwIfAborted();

      if (
        extractDefineEntity(await readFile(filePath, 'utf8')) !==
        TargetFunction.DefineApplication
      ) {
        continue;
      }

      if (isDefined(application)) {
        throw new Error('The project declares more than one application.');
      }

      const { config } = await extractManifestFromFile<unknown>({
        appPath,
        filePath,
      });

      if (
        !isPlainObject(config) ||
        !isString(config.universalIdentifier) ||
        !isValidUuid(config.universalIdentifier)
      ) {
        throw new Error(
          `Could not read the application identifier in ${relative(appPath, filePath)}.`,
        );
      }

      application = {
        universalIdentifier: config.universalIdentifier,
        displayName: isString(config.displayName) ? config.displayName : null,
      };
    }

    signal?.throwIfAborted();

    return { success: true, data: { application }, diagnostics: [] };
  } catch (error) {
    return {
      success: false,
      error: {
        code:
          signal?.aborted && Object.is(error, signal.reason)
            ? 'CANCELLED'
            : 'IDENTITY_READ_FAILED',
        message: error instanceof Error ? error.message : String(error),
      },
      diagnostics: [],
    };
  }
};

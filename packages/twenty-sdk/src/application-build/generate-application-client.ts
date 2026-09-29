import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isNonEmptyString, isObject } from '@sniptt/guards';
import { replaceCoreClient } from 'twenty-client-sdk/generate';

import {
  type BuildResult,
  type GenerateAppClientOptions,
} from '@/application-build/types';
import { validateAppPath } from '@/application-build/validate-app-path';

export const generateApplicationClient = async ({
  appPath,
  schema,
  signal,
}: GenerateAppClientOptions): Promise<BuildResult<null>> => {
  const validation = await validateAppPath(appPath);

  if (!validation.success) {
    return validation;
  }

  try {
    signal?.throwIfAborted();

    if (!isNonEmptyString(schema)) {
      throw new Error('schema must be a non-empty GraphQL schema string.');
    }

    const packageRoot = join(appPath, 'node_modules', 'twenty-client-sdk');
    const packageJson: unknown = JSON.parse(
      await readFile(join(packageRoot, 'package.json'), 'utf8'),
    );

    if (
      !isObject(packageJson) ||
      !('name' in packageJson) ||
      packageJson.name !== 'twenty-client-sdk'
    ) {
      throw new Error(
        'Expected twenty-client-sdk in the app node_modules directory.',
      );
    }

    signal?.throwIfAborted();
    await replaceCoreClient({ packageRoot, schema });
    signal?.throwIfAborted();

    return { success: true, data: null, diagnostics: [] };
  } catch (error) {
    return {
      success: false,
      error: {
        code:
          signal?.aborted && Object.is(error, signal.reason)
            ? 'CANCELLED'
            : 'CLIENT_GENERATION_FAILED',
        message: error instanceof Error ? error.message : String(error),
      },
      diagnostics: [],
    };
  }
};

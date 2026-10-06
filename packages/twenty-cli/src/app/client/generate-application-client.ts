import { realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { isFunction, isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ToolingResult } from '@/app/types/tooling-result.type';
import { readJsonObject } from '@/app/read-json-object';
import { resolveInsideSdk } from '@/app/project/resolve-inside-sdk';
import { validateAppPath } from '@/app/snapshots/validate-app-path';

export const generateApplicationClient = async ({
  appPath,
  schema,
  signal,
}: {
  appPath: string;
  schema: string;
  signal?: AbortSignal;
}): Promise<ToolingResult<null>> => {
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
    const packageJson = await readJsonObject(join(packageRoot, 'package.json'));

    if (packageJson?.name !== 'twenty-client-sdk') {
      throw new Error(
        'Expected twenty-client-sdk in the app node_modules directory.',
      );
    }

    const requireFromClient = createRequire(join(packageRoot, 'package.json'));
    const generatorPath = resolveInsideSdk({
      resolveFromApp: requireFromClient.resolve,
      specifier: 'twenty-client-sdk/generate',
      sdkPath: await realpath(packageRoot),
    });

    if (!isDefined(generatorPath)) {
      throw new Error(
        "The app's twenty-client-sdk does not provide its own generate entry point. Install a compatible twenty-client-sdk version in this app.",
      );
    }

    signal?.throwIfAborted();
    const generator: unknown = requireFromClient(generatorPath);

    if (!isPlainObject(generator) || !isFunction(generator.replaceCoreClient)) {
      throw new Error(
        "The app's twenty-client-sdk/generate must export replaceCoreClient.",
      );
    }

    signal?.throwIfAborted();
    await generator.replaceCoreClient({ packageRoot, schema });
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

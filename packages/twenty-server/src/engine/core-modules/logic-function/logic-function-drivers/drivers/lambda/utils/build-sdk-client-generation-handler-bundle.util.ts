import { existsSync } from 'fs';
import { join } from 'path';

import { build } from 'esbuild';
import { isDefined } from 'twenty-shared/utils';

import {
  SdkClientException,
  SdkClientExceptionCode,
} from 'src/engine/core-modules/sdk-client/exceptions/sdk-client.exception';

const HANDLER_DIRECTORY = join(__dirname, '..', 'sdk-client-generation');
const HANDLER_ENTRY_PATH_WITHOUT_EXTENSION = join(
  HANDLER_DIRECTORY,
  'sdk-client-generation-lambda.handler',
);

// twenty-shared only exposes barrels, which pull in React, class-validator and zod.
const FORBIDDEN_BUNDLE_INPUT_REGEX =
  /(?:^|\/)(?:@nestjs|typeorm|twenty-shared)\//;

// esbuild and archiver come from the common layer: esbuild ships a native binary.
const COMMON_LAYER_PACKAGES = ['esbuild', 'archiver'];

export const buildSdkClientGenerationHandlerBundle =
  async (): Promise<string> => {
    const compiledEntryPath = `${HANDLER_ENTRY_PATH_WITHOUT_EXTENSION}.js`;

    const result = await build({
      entryPoints: [
        existsSync(compiledEntryPath)
          ? compiledEntryPath
          : `${HANDLER_ENTRY_PATH_WITHOUT_EXTENSION}.ts`,
      ],
      bundle: true,
      platform: 'node',
      target: 'node22',
      format: 'cjs',
      external: COMMON_LAYER_PACKAGES,
      // Path comments in the bundle are relative to it, and the bundle is hashed
      // into the function name: the process's working directory must not matter.
      absWorkingDir: HANDLER_DIRECTORY,
      write: false,
      metafile: true,
      logLevel: 'silent',
    });

    const forbiddenInput = Object.keys(result.metafile.inputs).find((input) =>
      FORBIDDEN_BUNDLE_INPUT_REGEX.test(input),
    );

    if (isDefined(forbiddenInput)) {
      throw new SdkClientException(
        `The SDK client generation Lambda bundle must stay framework-free but includes ${forbiddenInput}`,
        SdkClientExceptionCode.GENERATION_FAILED,
      );
    }

    return result.outputFiles[0].text;
  };

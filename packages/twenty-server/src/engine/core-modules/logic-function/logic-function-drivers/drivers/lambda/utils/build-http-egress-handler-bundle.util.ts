import { existsSync } from 'fs';
import { join } from 'path';

import { build } from 'esbuild';
import { isDefined } from 'twenty-shared/utils';

const HANDLER_ENTRY_PATH_WITHOUT_EXTENSION = join(
  __dirname,
  '..',
  'http-egress',
  'http-egress-lambda.handler',
);

// twenty-shared only exposes barrels, which pull in React, class-validator and zod.
const FORBIDDEN_BUNDLE_INPUT_REGEX =
  /(?:^|\/)(?:@nestjs|typeorm|twenty-shared)\//;

// Bundled from the compiled server at runtime, so the Lambda always runs the code of the pod that invokes it.
export const buildHttpEgressHandlerBundle = async (): Promise<string> => {
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
    write: false,
    metafile: true,
    logLevel: 'silent',
  });

  const forbiddenInput = Object.keys(result.metafile.inputs).find((input) =>
    FORBIDDEN_BUNDLE_INPUT_REGEX.test(input),
  );

  if (isDefined(forbiddenInput)) {
    throw new Error(
      `The HTTP egress Lambda bundle must stay framework-free but includes ${forbiddenInput}`,
    );
  }

  return result.outputFiles[0].text;
};

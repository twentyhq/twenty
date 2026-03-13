import { appendFile, copyFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { generate } from '@genql/cli';
import { build } from 'esbuild';
import { DEFAULT_API_URL_NAME } from 'twenty-shared/application';

import { buildClientWrapperSource } from './client-wrapper';
import { emptyDir, ensureDir, move, remove } from './fs-utils';
import twentyClientTemplateSource from './twenty-client-template.ts?raw';

const COMMON_SCALAR_TYPES = {
  DateTime: 'string',
  JSON: 'Record<string, unknown>',
  UUID: 'string',
};

export const GENERATED_CORE_DIR = 'core/generated';

// Generates the core API client from a GraphQL schema string.
// Produces both TypeScript source and compiled ESM/CJS bundles.
export const generateCoreClientFromSchema = async ({
  schema,
  outputPath,
  clientWrapperTemplateSource,
}: {
  schema: string;
  outputPath: string;
  clientWrapperTemplateSource?: string;
}): Promise<void> => {
  const templateSource =
    clientWrapperTemplateSource ?? twentyClientTemplateSource;
  const tempPath = `${outputPath}.tmp`;

  await ensureDir(tempPath);
  await emptyDir(tempPath);

  try {
    await generate({
      schema,
      output: tempPath,
      scalarTypes: COMMON_SCALAR_TYPES,
    });

    const clientContent = buildClientWrapperSource(templateSource, {
      apiClientName: 'CoreApiClient',
      defaultUrl: `\`\${process.env.${DEFAULT_API_URL_NAME}}/graphql\``,
      includeUploadFile: true,
    });

    await appendFile(join(tempPath, 'index.ts'), clientContent);

    await remove(outputPath);
    await move(tempPath, outputPath);

    await compileGeneratedClient(outputPath);
  } catch (error) {
    await remove(tempPath);
    throw error;
  }
};

// Generates the core client and replaces the pre-built stub inside
// an installed twenty-client-sdk package (dist/core.mjs and dist/core.cjs).
// Generated source files are kept in dist/generated-core/ for consumers
// that need the raw .ts files (e.g. the app:dev upload step).
export const replaceCoreClient = async ({
  packageRoot,
  schema,
}: {
  packageRoot: string;
  schema: string;
}): Promise<void> => {
  const generatedPath = join(packageRoot, 'dist', GENERATED_CORE_DIR);

  await generateCoreClientFromSchema({ schema, outputPath: generatedPath });

  await copyFile(
    join(generatedPath, 'index.mjs'),
    join(packageRoot, 'dist', 'core.mjs'),
  );
  await copyFile(
    join(generatedPath, 'index.cjs'),
    join(packageRoot, 'dist', 'core.cjs'),
  );
};

const compileGeneratedClient = async (
  generatedDir: string,
): Promise<void> => {
  const entryPoint = join(generatedDir, 'index.ts');
  const outfile = join(generatedDir, 'index.mjs');

  await build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    sourcemap: false,
    minify: false,
  });

  await build({
    entryPoints: [entryPoint],
    outfile: join(generatedDir, 'index.cjs'),
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: false,
    minify: false,
  });

  await writeFile(
    join(generatedDir, 'package.json'),
    JSON.stringify(
      { type: 'module', main: 'index.mjs', module: 'index.mjs' },
      null,
      2,
    ),
  );
};

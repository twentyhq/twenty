import { appendFile, writeFile } from 'node:fs/promises';
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

// Generates the core API client from a GraphQL schema string.
// Produces both TypeScript source (for dev/typecheck) and a compiled
// ESM bundle (for runtime in Lambda/local execution layers).
export const generateCoreClientFromSchema = async ({
  schema,
  outputPath,
  clientWrapperTemplateSource = twentyClientTemplateSource,
}: {
  schema: string;
  outputPath: string;
  clientWrapperTemplateSource?: string;
}): Promise<void> => {
  const tempPath = `${outputPath}.tmp`;

  await ensureDir(tempPath);
  await emptyDir(tempPath);

  await generate({
    schema,
    output: tempPath,
    scalarTypes: COMMON_SCALAR_TYPES,
  });

  const clientContent = buildClientWrapperSource(
    clientWrapperTemplateSource,
    {
      apiClientName: 'CoreApiClient',
      defaultUrl: `\`\${process.env.${DEFAULT_API_URL_NAME}}/graphql\``,
      includeUploadFile: true,
    },
  );

  await appendFile(join(tempPath, 'index.ts'), clientContent);

  await remove(outputPath);
  await move(tempPath, outputPath);

  await compileGeneratedClient(outputPath);
};

// Bundles the generated TypeScript into a single ESM file so the
// package works at runtime without a separate build step.
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

  // Also produce a CJS bundle for require() consumers
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

  // Write a minimal package.json so Node resolves from the compiled output
  await writeFile(
    join(generatedDir, 'package.json'),
    JSON.stringify(
      { type: 'module', main: 'index.mjs', module: 'index.mjs' },
      null,
      2,
    ),
  );
};

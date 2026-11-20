import { appendFile, copyFile, realpath, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

import { build, type Plugin } from 'esbuild';

import { buildDefaultApiUrlExpression } from './build-default-api-url-expression';
import { buildClientWrapperSource } from './client-wrapper';
import { emptyDir, ensureDir, move, remove } from './fs-utils';
import { generate } from './genql';
import twentyClientTemplateSource from './twenty-client-template.ts?raw';

const COMMON_SCALAR_TYPES = {
  DateTime: 'string',
  JSON: 'unknown',
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
      defaultUrl: buildDefaultApiUrlExpression('/graphql'),
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

const isInsideDirectory = (directory: string, filePath: string): boolean => {
  const relativePath = relative(directory, filePath);

  return (
    relativePath !== '' &&
    relativePath !== '..' &&
    !relativePath.startsWith(`..${sep}`) &&
    !isAbsolute(relativePath)
  );
};

const REFUSED_IMPORT = {
  errors: [
    {
      text: 'The generated client may only import files from its own directory',
    },
  ],
};

const confineToDirectory = (directoryRealPath: string): Plugin => ({
  name: 'confine-to-generated-directory',
  setup: (pluginBuild) => {
    let hasRefusedFile = false;

    pluginBuild.onResolve(
      { filter: /.*/ },
      async ({ kind, path, resolveDir }) => {
        if (kind === 'entry-point') {
          return undefined;
        }

        const isRelativeImportInsideDirectory =
          (path.startsWith('./') || path.startsWith('../')) &&
          resolveDir !== '' &&
          isInsideDirectory(
            directoryRealPath,
            resolve(await realpath(resolveDir), path),
          );

        return isRelativeImportInsideDirectory ? undefined : REFUSED_IMPORT;
      },
    );

    pluginBuild.onLoad({ filter: /.*/ }, async ({ namespace, path }) => {
      if (
        namespace === 'file' &&
        isInsideDirectory(directoryRealPath, await realpath(path))
      ) {
        return undefined;
      }

      if (hasRefusedFile) {
        return { contents: '', loader: 'empty' };
      }

      hasRefusedFile = true;

      return REFUSED_IMPORT;
    });
  },
});

const compileGeneratedClient = async (generatedDir: string): Promise<void> => {
  const entryPoint = join(generatedDir, 'index.ts');
  const outfile = join(generatedDir, 'index.mjs');
  const plugins = [confineToDirectory(await realpath(generatedDir))];

  await build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    sourcemap: false,
    minify: false,
    plugins,
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
    plugins,
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

import {
  appendFile,
  copyFile,
  mkdtemp,
  readdir,
  readFile,
  writeFile,
} from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { build } from 'esbuild';
import { DEFAULT_API_URL_NAME } from 'twenty-shared/application';

import { buildClientWrapperSource } from './client-wrapper';
import { ensureDir, move, remove } from './fs-utils';
import { generate } from './genql';
import twentyClientTemplateSource from './twenty-client-template.ts?raw';

const COMMON_SCALAR_TYPES = {
  DateTime: 'string',
  JSON: 'Record<string, unknown>',
  UUID: 'string',
};

export const GENERATED_CORE_DIR = 'core/generated';

// Generates into a unique sibling temp directory (so a pre-existing,
// unrelated `<output>.tmp` is never touched), lets the caller finalize the
// temp output, then atomically swaps it into place. The temp directory is
// removed on failure.
const generateIntoOutputPath = async ({
  schema,
  outputPath,
  typesOnly = false,
  finalizeTempOutput,
}: {
  schema: string;
  outputPath: string;
  typesOnly?: boolean;
  finalizeTempOutput?: (tempPath: string) => Promise<void>;
}): Promise<void> => {
  await ensureDir(dirname(outputPath));

  const tempPath = await mkdtemp(`${outputPath}.tmp-`);

  try {
    await generate({
      schema,
      output: tempPath,
      scalarTypes: COMMON_SCALAR_TYPES,
      typesOnly,
    });

    await finalizeTempOutput?.(tempPath);

    await remove(outputPath);
    await move(tempPath, outputPath);
  } catch (error) {
    await remove(tempPath);
    throw error;
  }
};

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

  await generateIntoOutputPath({
    schema,
    outputPath,
    finalizeTempOutput: async (tempPath) => {
      const clientContent = buildClientWrapperSource(templateSource, {
        apiClientName: 'CoreApiClient',
        // Read through the template's safe accessor: a bare `process.env` at
        // module scope throws in browsers before any client is constructed.
        defaultUrl: `\`\${getProcessEnvironment().${DEFAULT_API_URL_NAME}}/graphql\``,
        includeUploadFile: true,
      });

      await appendFile(join(tempPath, 'index.ts'), clientContent);
    },
  });

  await compileGeneratedClient(outputPath);
};

// Generates the core client as committable TypeScript source: no esbuild
// bundles, so the consumer's own toolchain compiles it. The CoreApiClient
// wrapper is intentionally not injected: it authenticates from in-app env
// vars (TWENTY_APP_ACCESS_TOKEN/TWENTY_API_KEY), which out-of-app consumers
// don't have — they call the emitted createClient with their own url, fetch
// and auth headers instead. With `typesOnly` the output is a single schema.ts
// (response types, enum constant maps, scalar aliases) without
// request/selection types or any runtime code.
export const generateCoreClientSource = async ({
  schema,
  outputPath,
  typesOnly = false,
  provenanceHeader,
}: {
  schema: string;
  outputPath: string;
  typesOnly?: boolean;
  provenanceHeader?: string;
}): Promise<void> => {
  await assertOutputPathSafeToOverwrite(outputPath);

  await generateIntoOutputPath({
    schema,
    outputPath,
    typesOnly,
    finalizeTempOutput:
      provenanceHeader !== undefined
        ? (tempPath) =>
            prependHeaderToTypescriptFiles(tempPath, provenanceHeader)
        : undefined,
  });
};

const GENERATED_OUTPUT_ENTRIES = new Set([
  'schema.ts',
  'schema.graphql',
  'types.ts',
  'index.ts',
  'runtime',
]);

// The output path is recursively replaced on regeneration, so only overwrite
// a directory whose every entry is a known generated file (a caller passing
// e.g. `--output .`, or a directory that merely happens to contain a
// schema.ts among real sources, must not be wiped).
const assertOutputPathSafeToOverwrite = async (
  outputPath: string,
): Promise<void> => {
  let entries: string[];

  try {
    entries = await readdir(outputPath);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }

  if (entries.every((entry) => GENERATED_OUTPUT_ENTRIES.has(entry))) {
    return;
  }

  throw new Error(
    `Refusing to overwrite ${outputPath}: it contains files that are not part of a previously generated client. Use an empty or dedicated directory.`,
  );
};

const prependHeaderToTypescriptFiles = async (
  directory: string,
  header: string,
): Promise<void> => {
  const entries = await readdir(directory, {
    withFileTypes: true,
    recursive: true,
  });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
      .map(async (entry) => {
        const filePath = join(entry.parentPath, entry.name);
        const content = await readFile(filePath, 'utf-8');

        await writeFile(filePath, `// ${header}\n${content}`);
      }),
  );
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

const compileGeneratedClient = async (generatedDir: string): Promise<void> => {
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

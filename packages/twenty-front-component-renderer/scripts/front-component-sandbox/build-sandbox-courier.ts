import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build, type Rollup } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(dirname, '../..');

const courierEntry = path.resolve(
  projectRoot,
  'src/remote/sandbox/sandbox-courier.ts',
);

const generatedFile = path.resolve(
  projectRoot,
  'src/remote/sandbox/generated/frontComponentSandboxCourierSource.ts',
);

const replaceProcessEnv = (code: string): string =>
  code
    .replace(/process\.env\.NODE_ENV/g, JSON.stringify('production'))
    .replace(/process\.env/g, '{}');

const buildSandboxCourier = async (): Promise<void> => {
  const buildResult = await build({
    configFile: false,
    root: projectRoot,
    resolve: {
      alias: {
        '@/': path.resolve(projectRoot, 'src') + '/',
      },
    },
    worker: {
      format: 'iife',
      plugins: () => [
        {
          name: 'define-process-env',
          transform: replaceProcessEnv,
        },
      ],
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
      write: false,
      lib: {
        entry: courierEntry,
        formats: ['iife'],
        name: 'frontComponentSandboxCourier',
        fileName: () => 'sandbox-courier.js',
      },
    },
    logLevel: 'warn',
  });

  const rollupOutputs = (
    Array.isArray(buildResult) ? buildResult : [buildResult]
  ).filter((item): item is Rollup.RollupOutput => 'output' in item);

  const courierChunk = rollupOutputs
    .flatMap((result) => result.output)
    .find((item): item is Rollup.OutputChunk => item.type === 'chunk');

  if (courierChunk === undefined) {
    throw new Error(
      'Failed to build the front component sandbox courier bundle',
    );
  }

  const generatedSource = `export const FRONT_COMPONENT_SANDBOX_COURIER_SOURCE = ${JSON.stringify(
    courierChunk.code,
  )};\n`;

  fs.mkdirSync(path.dirname(generatedFile), { recursive: true });
  fs.writeFileSync(generatedFile, generatedSource, 'utf8');
};

buildSandboxCourier().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

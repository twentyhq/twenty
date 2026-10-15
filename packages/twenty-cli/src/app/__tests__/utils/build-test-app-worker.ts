import { mkdir, symlink } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDefined } from 'twenty-shared/utils';
import { build, loadConfigFromFile } from 'vite';
import { vi } from 'vitest';

export const buildTestAppWorker = async (
  workerPath: string,
  {
    useToolingFixture = false,
    aliases = {},
  }: { useToolingFixture?: boolean; aliases?: Record<string, string> } = {},
) => {
  const cliRoot = fileURLToPath(new URL('../../../../', import.meta.url));

  const loaded = await loadConfigFromFile(
    { command: 'build', mode: 'production' },
    join(cliRoot, 'vite.config.ts'),
  );

  if (!isDefined(loaded)) {
    throw new Error('Could not load the CLI bundle configuration.');
  }

  vi.stubEnv('NODE_ENV', 'production');

  try {
    await build({
      ...loaded.config,
      configFile: false,
      plugins: [],
      resolve: {
        ...loaded.config.resolve,
        alias: {
          ...aliases,
          ...(useToolingFixture
            ? Object.fromEntries(
                [
                  '@/app/worker/build-source-snapshot',
                  '@/app/typecheck/typecheck-application',
                  '@/app/client/generate-application-client',
                ].map((specifier) => [
                  specifier,
                  join(
                    cliRoot,
                    'src/app/__tests__/utils/worker-tooling-fixture.ts',
                  ),
                ]),
              )
            : {}),
          ...loaded.config.resolve?.alias,
        },
      },
      build: {
        ...loaded.config.build,
        rollupOptions: {
          ...loaded.config.build?.rollupOptions,
          external: (id, importer, isResolved) => {
            const external = loaded.config.build?.rollupOptions?.external;

            return (
              Object.values(aliases).includes(id) ||
              (typeof external === 'function' &&
                external(id, importer, isResolved))
            );
          },
        },
        outDir: workerPath,
        lib: {
          entry: {
            'app-worker': join(cliRoot, 'src/app/worker/app-worker.ts'),
          },
          formats: ['cjs'],
        },
      },
    });
  } finally {
    vi.unstubAllEnvs();
  }
  await mkdir(join(workerPath, 'node_modules'));
  const resolve = createRequire(import.meta.url).resolve;

  for (const name of ['esbuild', 'typescript', 'tinyglobby']) {
    await symlink(
      dirname(resolve(`${name}/package.json`)),
      join(workerPath, 'node_modules', name),
    );
  }
};

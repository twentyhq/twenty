import { FUNCTIONS_DIR } from '@/cli/constants/functions-dir';
import { GENERATED_DIR } from '@/cli/constants/generated-dir';
import { OUTPUT_DIR } from '@/cli/constants/output-dir';
import path from 'path';
import { build, type InlineConfig, type Rollup } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Default externals for serverless functions
export const EXTERNAL_MODULES: (string | RegExp)[] = [
  'path', 'fs', 'crypto', 'stream', 'util', 'os', 'url', 'http', 'https',
  'events', 'buffer', 'querystring', 'assert', 'zlib', 'net', 'tls',
  'child_process', 'worker_threads',
  /^twenty-sdk/, /^twenty-shared/, /^@\//, /(?:^|\/)generated(?:\/|$)/,
];

export type DevServerOptions = {
  appPath: string;
  functionInput: Record<string, string>;
  plugins?: InlineConfig['plugins'];
};

export type BuildWatcher = Rollup.RollupWatcher;

/**
 * Creates Vite build config for function building with watch mode.
 */
export const createDevServerConfig = (options: DevServerOptions): InlineConfig => {
  const { appPath, functionInput, plugins = [] } = options;

  const outputDir = path.join(appPath, OUTPUT_DIR);
  const functionsOutputDir = path.join(outputDir, FUNCTIONS_DIR);
  const hasFunctions = Object.keys(functionInput).length > 0;

  // Use application.config.ts as placeholder when no functions exist
  const entry = hasFunctions
    ? functionInput
    : { __placeholder__: path.join(appPath, 'src/app/application.config.ts') };

  return {
    root: appPath,
    plugins: [
      tsconfigPaths({ root: appPath }),
      ...plugins,
    ],
    build: {
      outDir: functionsOutputDir,
      emptyOutDir: false,
      watch: {
        include: ['src/**/*.ts', 'src/**/*.json'],
        exclude: ['node_modules/**', '.twenty/**', 'dist/**'],
      },
      lib: {
        entry,
        formats: ['es'],
        fileName: (_, entryName) => `${entryName}.js`,
      },
      rollupOptions: {
        external: hasFunctions ? EXTERNAL_MODULES : [/.*/],
        treeshake: hasFunctions,
        output: {
          preserveModules: false,
          exports: 'named',
          paths: (id: string) => {
            if (/(?:^|\/)generated(?:\/|$)/.test(id)) {
              return `../${GENERATED_DIR}/index.js`;
            }
            return id;
          },
        },
      },
      minify: false,
      sourcemap: hasFunctions,
    },
    logLevel: 'silent',
    configFile: false,
  };
};

/**
 * Creates a Vite build watcher for function building.
 * Uses build with watch mode to actually write files to disk.
 */
export const createDevServer = async (
  options: DevServerOptions,
): Promise<BuildWatcher> => {
  const config = createDevServerConfig(options);
  const watcher = await build(config);
  return watcher as BuildWatcher;
};

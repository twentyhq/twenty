import { FUNCTIONS_DIR } from '@/cli/constants/functions-dir';
import { GENERATED_DIR } from '@/cli/constants/generated-dir';
import { OUTPUT_DIR } from '@/cli/constants/output-dir';
import path from 'path';
import { type InlineConfig, type Plugin } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Default externals for serverless functions
export const EXTERNAL_MODULES: (string | RegExp)[] = [
  'path', 'fs', 'crypto', 'stream', 'util', 'os', 'url', 'http', 'https',
  'events', 'buffer', 'querystring', 'assert', 'zlib', 'net', 'tls',
  'child_process', 'worker_threads',
  /^twenty-sdk/, /^twenty-shared/, /^@\//, /(?:^|\/)generated(?:\/|$)/,
];

export type DevBuildConfigOptions = {
  appPath: string;
  functionInput: Record<string, string>;
  plugins?: Plugin[];
};

/**
 * Creates Vite build configuration for dev mode function building.
 */
export const createDevBuildConfig = (options: DevBuildConfigOptions): InlineConfig => {
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
      watch: {},
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
    logLevel: hasFunctions ? 'warn' : 'silent',
    configFile: false,
  };
};

import path from 'path';
import { createServer, type UserConfig, type ViteDevServer } from 'vite';

import { buildRollupInput } from './entry-points';

export type DevServerOptions = {
  appPath: string;
  functionEntryPoints: string[];
  plugins?: UserConfig['plugins'];
};

/**
 * Creates the base Vite dev server configuration for Twenty app development.
 */
export const createDevServerConfig = (options: DevServerOptions): UserConfig => {
  const { appPath, functionEntryPoints, plugins = [] } = options;

  // Build rollup input object from function entry points
  const rollupInput = buildRollupInput(appPath, functionEntryPoints);

  return {
    root: appPath,
    plugins,
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/.twenty/**', '**/dist/**'],
      },
      port: 0,
      open: false,
      hmr: false,
    },
    optimizeDeps: {
      noDiscovery: true,
    },
    logLevel: 'silent',
    publicDir: false,
    build: {
      watch: {
        include: [path.join(appPath, 'src/**')],
      },
      rollupOptions: {
        input: rollupInput,
      },
    },
  };
};

/**
 * Creates a Vite dev server for Twenty app development.
 */
export const createDevServer = async (
  options: DevServerOptions,
): Promise<ViteDevServer> => {
  const config = createDevServerConfig(options);

  return createServer(config);
};

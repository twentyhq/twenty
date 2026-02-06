import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

const entries = [
  'src/index.ts',
  'src/cli/cli.ts',
  'src/ui/index.ts',
  'src/front-component/index.ts',
];

const entryFileNames = (chunk: any, extension: 'cjs' | 'mjs') => {
  if (!chunk.isEntry) {
    throw new Error(
      `Should never occurs, encountered a non entry chunk ${chunk.facadeModuleId}`,
    );
  }

  // Find which entry this chunk corresponds to
  const entry = entries.find((e) => chunk.facadeModuleId?.endsWith(e));
  if (!entry || entry === 'src/index.ts' || entry === 'src/cli/cli.ts') {
    return `${chunk.name}.${extension}`;
  }

  // Remove 'src/' prefix and '/index.ts' suffix to get the module path
  const modulePath = entry.replace('src/', '').replace('/index.ts', '');
  return `${modulePath}/index.${extension}`;
};

export default defineConfig(() => {
  const tsConfigPath = path.resolve(__dirname, './tsconfig.lib.json');

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-sdk',
    resolve: {
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    plugins: [
      tsconfigPaths({
        root: __dirname,
      }),
      dts({ entryRoot: './src', tsconfigPath: tsConfigPath }),
    ],
    worker: {
      format: 'iife',
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
      plugins: () => [
        {
          name: 'define-process-env',
          transform: (code: string) =>
            code
              .replace(/process\.env\.NODE_ENV/g, JSON.stringify('production'))
              .replace(/process\.env/g, '{}'),
        },
      ],
    },
    build: {
      outDir: 'dist',
      lib: { entry: entries, name: 'twenty-sdk' },
      rollupOptions: {
        onwarn: (warning, warn) => {
          // Suppress "use client" directive warnings from framer-motion
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
            warning.message.includes('"use client"')
          ) {
            return;
          }
          warn(warning);
        },
        external: [
          ...Object.keys((packageJson as any).dependencies || {}),
          'path',
          'fs',
          'fs/promises',
          'url',
          'crypto',
          'stream',
          'util',
          'os',
          'module',
          /^node:/,
        ],
        output: [
          {
            format: 'es',
            entryFileNames: (chunk) => entryFileNames(chunk, 'mjs'),
          },
          {
            format: 'cjs',
            interop: 'auto',
            esModule: true,
            exports: 'named',
            entryFileNames: (chunk) => entryFileNames(chunk, 'cjs'),
          },
        ],
      },
    },
    logLevel: 'warn',
    optimizeDeps: {
      include: [
        '@remote-dom/core/polyfill',
        '@remote-dom/react/polyfill',
        '@remote-dom/core/elements',
        '@remote-dom/react',
        '@remote-dom/react/host',
        'react-dom/client',
        'react/jsx-runtime',
      ],
    },
  };
});

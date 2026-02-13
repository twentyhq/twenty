import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';


const entries = ['src/ui/index.ts', 'src/front-component-renderer/index.ts'];

const entryFileNames = (chunk: any, extension: 'cjs' | 'mjs') => {
  if (!chunk.isEntry) {
    throw new Error(
      `Should never occur, encountered a non-entry chunk ${chunk.facadeModuleId}`,
    );
  }

  const entry = entries.find((entryPath) =>
    chunk.facadeModuleId?.endsWith(entryPath),
  );

  if (!entry) {
    return `${chunk.name}.${extension}`;
  }

  // Remove 'src/' prefix and '/index.ts' suffix to get the module path
  const modulePath = entry.replace('src/', '').replace('/index.ts', '');

  return `${modulePath}/index.${extension}`;
};

export default defineConfig(() => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-sdk-browser',
    resolve: {
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    plugins: [
      tsconfigPaths({
        root: __dirname,
      }),
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
      emptyOutDir: false,
      outDir: 'dist',
      lib: { entry: entries, name: 'twenty-sdk' },
      rollupOptions: {
        onwarn: (warning, warn) => {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
            warning.message.includes('"use client"')
          ) {
            return;
          }
          warn(warning);
        },
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

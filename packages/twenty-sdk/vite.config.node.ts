import fs from 'fs';
import path from 'path';
import { type PackageJson } from 'type-fest';
import { defineConfig } from 'vite';

import packageJson from './package.json';

// Injected at the top of every ESM chunk so bundled CommonJS modules keep
// working after rolldown inlines them into the `.mjs` output. They call
// `require(...)` and read `__filename` / `__dirname` at runtime — none of which
// exist in an ES module — so we recreate them from `import.meta.url`. Without
// this the CLI crashes on startup ("Calling `require` for \"fs\" ...",
// "__filename is not defined"). The CJS output already provides all three.
// Aliased imports avoid colliding with bindings that already exist in a chunk.
//
// Note: __filename / __dirname resolve to the emitted chunk's own location
// (dist/), not each inlined module's original node_modules path — so a bundled
// dependency that reads __dirname to locate sibling files points at dist/.
// esbuild's CJS-globals shim had the same limitation, so this is not a
// regression; our own __dirname usage already targets dist/ intentionally.
const esmNodeGlobalsBanner = [
  "import { createRequire as __twentyCreateRequire } from 'node:module';",
  "import { fileURLToPath as __twentyFileURLToPath } from 'node:url';",
  "import { dirname as __twentyDirname } from 'node:path';",
  'const require = __twentyCreateRequire(import.meta.url);',
  'const __filename = __twentyFileURLToPath(import.meta.url);',
  'const __dirname = __twentyDirname(__filename);',
].join('\n');

const copyCoverAssetsPlugin = () => ({
  name: 'copy-cover-assets',
  closeBundle() {
    const source = path.resolve(
      __dirname,
      'src/cli/utilities/build/cover/assets/halftone-backdrop.png',
    );
    const destinationDir = path.resolve(__dirname, 'dist/assets');

    fs.mkdirSync(destinationDir, { recursive: true });
    fs.copyFileSync(source, path.join(destinationDir, 'halftone-backdrop.png'));
  },
});

export default defineConfig(() => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-sdk-node',
    resolve: {
      tsconfigPaths: true,
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    plugins: [copyCoverAssetsPlugin()],
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      lib: {
        entry: {
          cli: 'src/cli/cli.ts',
          operations: 'src/cli/operations/index.ts',
          'front-component-renderer/build':
            'src/front-component-renderer/build/index.ts',
        },
        name: 'twenty-sdk',
      },
      rollupOptions: {
        external: (id: string) => {
          if (/^node:/.test(id)) {
            return true;
          }

          const builtins = [
            'child_process',
            'crypto',
            'fs',
            'fs/promises',
            'module',
            'os',
            'path',
            'stream',
            'url',
            'util',
          ];

          if (builtins.includes(id)) {
            return true;
          }

          const deps = Object.keys(
            (packageJson as PackageJson).dependencies || {},
          );

          return deps.some((dep) => id === dep || id.startsWith(dep + '/'));
        },
        output: [
          {
            format: 'es' as const,
            entryFileNames: '[name].mjs',
            banner: esmNodeGlobalsBanner,
          },
          {
            format: 'cjs' as const,
            esModule: true,
            exports: 'named' as const,
            entryFileNames: '[name].cjs',
          },
        ],
      },
    },
    logLevel: 'warn' as const,
  };
});

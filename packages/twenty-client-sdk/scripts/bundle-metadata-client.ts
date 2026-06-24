import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

// The Vite multi-entry build emits a shared `chunk-*.mjs` that the metadata
// client imports relatively. The front-component renderer loads each SDK client
// as a single blob URL and cannot resolve relative chunk imports, so the
// metadata client must be a single self-contained module. This re-bundles the
// pre-generated metadata client into one file, mirroring the single-file output
// the core client gets at runtime (see compileGeneratedClient in
// src/generate/generate-core-client.ts).

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const entryPoint = path.join(packageRoot, 'src', 'metadata', 'index.ts');
const distDir = path.join(packageRoot, 'dist');

const main = async () => {
  await build({
    entryPoints: [entryPoint],
    outfile: path.join(distDir, 'metadata.mjs'),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    sourcemap: false,
    minify: false,
  });

  await build({
    entryPoints: [entryPoint],
    outfile: path.join(distDir, 'metadata.cjs'),
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: false,
    minify: false,
  });

  console.log(
    'Bundled metadata client into single-file dist/metadata.{mjs,cjs}',
  );
};

main().catch((error) => {
  console.error('Failed to bundle metadata client:', error);
  process.exit(1);
});

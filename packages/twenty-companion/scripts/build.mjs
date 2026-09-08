import { build } from 'esbuild';
import { build as buildRenderer } from 'vite';
import { mkdir } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
await build({
  entryPoints: { main: 'src/main/main.ts', preload: 'src/main/preload.ts' },
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outdir: 'dist',
  outExtension: { '.js': '.cjs' },
  external: ['electron', '@recallai/desktop-sdk'],
  sourcemap: true,
});
await buildRenderer();

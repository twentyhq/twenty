import { build } from 'esbuild';
import { build as buildRenderer } from 'vite';
import { electronBuildOptions } from './electron-build.mjs';

await build(electronBuildOptions);
await buildRenderer();

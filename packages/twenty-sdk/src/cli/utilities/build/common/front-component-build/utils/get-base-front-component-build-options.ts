import type * as esbuild from 'esbuild';

import { FRONT_COMPONENT_EXTERNAL_MODULES } from '../constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from './get-front-component-build-plugins';

// `getBaseFrontComponentBuildOptions` is consumed only by `build-application.ts`
// (the `twenty deploy` and `twenty build` orchestrators). The watch-mode dev
// build in `esbuild-watcher.ts` has its own configuration path that intentionally
// keeps `minify` off and `process.env.NODE_ENV` undefined, so `twenty dev`
// remains debuggable.
//
// For deploy/build (one-shot, intended to ship to a Twenty server), we want:
//   • `minify: true` — without it, every front-component .mjs ships unminified.
//     A trivial widget shipping React + the design system AOT measures
//     ~2 MB unminified vs ~860 KB minified. Because Twenty spawns a fresh
//     Worker on every widget mount and re-parses the bundle inside it, that
//     2× size translates directly into 2× cold-start latency on every record
//     navigation. Minification is the single largest perf win available without
//     changing the worker lifecycle.
//   • `define: { 'process.env.NODE_ENV': '"production"' }` — React and most
//     userland libraries gate large amounts of dev-only code (warnings,
//     schedulers, profiler hooks) behind `process.env.NODE_ENV !== 'production'`.
//     Without this define, esbuild keeps the development paths in the bundle
//     because the variable is undefined at build time. Setting it lets the
//     dead-code elimination pass remove them.
export const getBaseFrontComponentBuildOptions = (): esbuild.BuildOptions => ({
  bundle: true,
  splitting: false,
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: FRONT_COMPONENT_EXTERNAL_MODULES,
  jsx: 'automatic',
  sourcemap: true,
  metafile: true,
  logLevel: 'silent',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [...getFrontComponentBuildPlugins()],
});

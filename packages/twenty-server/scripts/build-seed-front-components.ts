// Script to build seed front component .tsx files into .mjs using the same
// esbuild pipeline as the twenty-sdk CLI (Remote DOM + JSX wrapping).
//
// Usage: npx tsx scripts/build-seed-front-components.ts

import * as esbuild from 'esbuild';
import { join, resolve } from 'path';
import { getFrontComponentBuildPlugins } from 'twenty-sdk/front-component-renderer/build';

const ROOT_DIR = resolve(__dirname, '../../..');
const ROOT_NODE_MODULES = resolve(ROOT_DIR, 'node_modules');

const SEED_PROJECT_DIR = resolve(
  __dirname,
  '../src/engine/metadata-modules/front-component/constants/seed-project',
);

const alias: Record<string, string> = {
  react: join(ROOT_NODE_MODULES, 'react'),
  'react-dom': join(ROOT_NODE_MODULES, 'react-dom'),
};

const COMPONENTS = ['hello-world', 'show-notification'];

const build = async () => {
  for (const component of COMPONENTS) {
    const entryPoint = join(SEED_PROJECT_DIR, component, 'index.tsx');
    const outdir = join(SEED_PROJECT_DIR, component);

    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      splitting: false,
      format: 'esm',
      outExtension: { '.js': '.mjs' },
      external: [
        'twenty-client-sdk/core',
        'twenty-client-sdk/metadata',
        'twenty-shared/*',
      ],
      jsx: 'automatic',
      sourcemap: false,
      metafile: false,
      minify: true,
      logLevel: 'info',
      outdir,
      alias,
      plugins: [...getFrontComponentBuildPlugins()],
    });

    console.log(`Built ${component}/index.mjs`);
  }
};

build().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});

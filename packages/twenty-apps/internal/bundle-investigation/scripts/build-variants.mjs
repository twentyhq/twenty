#!/usr/bin/env node
import * as esbuild from '../../../../../node_modules/esbuild/lib/main.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { statSync, readdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_PATH = resolve(__dirname, '..');
const REPO_ROOT = resolve(APP_PATH, '../../../..');
const SRC_DIR = join(APP_PATH, 'src/logic-functions');
const OUT_DIR = join(APP_PATH, 'out');

const TWENTY_SDK_DEFINE_ENTRY = join(
  REPO_ROOT,
  'packages/twenty-sdk/dist/define/index.mjs',
);
const TWENTY_SDK_DEEP_ROOT = join(REPO_ROOT, 'packages/twenty-sdk/dist/define');

const LOGIC_FUNCTION_EXTERNAL_MODULES = [
  'twenty-client-sdk/core',
  'twenty-client-sdk/metadata',
  'path',
  'fs',
  'crypto',
  'stream',
  'util',
  'os',
  'url',
  'http',
  'https',
  'events',
  'buffer',
  'querystring',
  'assert',
  'zlib',
  'net',
  'tls',
  'child_process',
  'worker_threads',
];

const NODE_ESM_CJS_BANNER = {
  js: `import { createRequire as __twenty_createRequire } from 'module';\nconst require = __twenty_createRequire(import.meta.url);`,
};

const variants = readdirSync(SRC_DIR)
  .filter((f) => f.endsWith('.ts'))
  .sort();

console.log(`Building ${variants.length} variants → ${OUT_DIR}\n`);

await mkdir(OUT_DIR, { recursive: true });

const results = [];

for (const variant of variants) {
  const name = variant.replace(/\.ts$/, '');
  const entry = join(SRC_DIR, variant);
  const outFile = join(OUT_DIR, `${name}.mjs`);
  const metaFile = join(OUT_DIR, `${name}.meta.json`);

  const t0 = Date.now();
  const result = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    splitting: false,
    format: 'esm',
    platform: 'node',
    outfile: outFile,
    external: LOGIC_FUNCTION_EXTERNAL_MODULES,
    tsconfig: join(APP_PATH, 'tsconfig.json'),
    sourcemap: false,
    metafile: true,
    logLevel: 'silent',
    banner: NODE_ESM_CJS_BANNER,
    absWorkingDir: APP_PATH,
    alias: {
      'twenty-sdk/define': TWENTY_SDK_DEFINE_ENTRY,
      'twenty-sdk-deep/define-logic-function': join(
        TWENTY_SDK_DEEP_ROOT,
        'logic-functions/define-logic-function.mjs',
      ),
    },
    nodePaths: [join(REPO_ROOT, 'node_modules')],
  });
  const buildMs = Date.now() - t0;

  await writeFile(metaFile, JSON.stringify(result.metafile, null, 2));

  const size = statSync(outFile).size;
  results.push({ name, size, buildMs });

  console.log(
    `  ${name.padEnd(28)} ${(size / 1024).toFixed(1).padStart(8)} KB   built in ${buildMs}ms`,
  );
}

console.log(`\nMetafiles written next to bundles. Run 'yarn analyze' to break down each.\n`);

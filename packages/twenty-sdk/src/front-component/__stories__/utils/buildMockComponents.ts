import * as esbuild from 'esbuild';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { jsxTransformToRemoteDomWorkerFormatPlugin } from '../../../cli/utilities/build/common/front-component-build/jsx-transform-to-remote-dom-worker-format-plugin';
import { reactGlobalsPlugin } from '../../../cli/utilities/build/common/front-component-build/react-globals-plugin';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const mocksDir = path.resolve(dirname, '../mocks');
const outputDir = path.resolve(dirname, '../built');

const STORY_COMPONENTS = [
  'static.front-component',
  'interactive.front-component',
  'lifecycle.front-component',
];

export const buildMockComponents = async (): Promise<void> => {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const entryPoints: Record<string, string> = {};

  for (const name of STORY_COMPONENTS) {
    entryPoints[name] = path.join(mocksDir, `${name}.tsx`);
  }

  await esbuild.build({
    entryPoints,
    bundle: true,
    format: 'esm',
    outdir: outputDir,
    outExtension: { '.js': '.mjs' },
    external: ['react', 'react-dom', 'twenty-sdk', 'twenty-sdk/*'],
    jsx: 'automatic',
    sourcemap: true,
    alias: {
      '@/sdk': path.resolve(dirname, '../../../sdk'),
    },
    plugins: [reactGlobalsPlugin, jsxTransformToRemoteDomWorkerFormatPlugin],
  });

  console.log(
    `Built ${STORY_COMPONENTS.length} story components to ${outputDir}`,
  );
};

buildMockComponents().catch((error) => {
  console.error('Failed to build mock components:', error);
  process.exit(1);
});

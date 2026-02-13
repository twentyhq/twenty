import * as esbuild from 'esbuild';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createFrontComponentBuildOptions } from './utils/create-front-component-build-options';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const exampleSourcesDir = path.resolve(dirname, '../../src/front-component-renderer/__stories__/example-sources');
const exampleSourcesBuiltDir = path.resolve(dirname, '../../src/front-component-renderer/__stories__/example-sources-built');
const sdkRoot = path.resolve(dirname, '../../../..');

const STORY_COMPONENTS = [
  'static.front-component',
  'interactive.front-component',
  'lifecycle.front-component',
  'chakra-example.front-component',
  'tailwind-example.front-component',
  'emotion-example.front-component',
  'styled-components-example.front-component',
  'shadcn-example.front-component',
  'mui-example.front-component',
  'twenty-ui-example.front-component',
];

export const buildSourceExamples = async (): Promise<void> => {
  fs.mkdirSync(exampleSourcesBuiltDir, { recursive: true });

  const entryPoints: Record<string, string> = {};

  for (const name of STORY_COMPONENTS) {
    const filePath = path.join(exampleSourcesDir, `${name}.tsx`);
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Story component source file not found: ${filePath}\n` +
          `Ensure the file exists in ${exampleSourcesDir} and the name in STORY_COMPONENTS is correct.`,
      );
    }
    entryPoints[name] = filePath;
  }

  const buildOptions = createFrontComponentBuildOptions({
    entryPoints,
    outdir: exampleSourcesBuiltDir,
    tsconfigPath: path.join(dirname, '../../tsconfig.json'),
  });

  await esbuild.build(buildOptions);

  console.log(
    `Built ${STORY_COMPONENTS.length} story components to ${exampleSourcesBuiltDir}`,
  );
};

buildSourceExamples().catch((error) => {
  console.error('Failed to build mock components:', error);
  process.exit(1);
});

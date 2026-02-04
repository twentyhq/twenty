import * as esbuild from 'esbuild';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createFrontComponentBuildOptions } from '../../../cli/utilities/build/common/front-component-build/utils/create-front-component-build-options';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const mocksDir = path.resolve(dirname, '../mocks');
const outputDir = path.resolve(dirname, '../built');
const sdkRoot = path.resolve(dirname, '../../../..');

const STORY_COMPONENTS = [
  'static.front-component',
  'interactive.front-component',
  'lifecycle.front-component',
];

export const buildMockComponents = async (): Promise<void> => {
  fs.mkdirSync(outputDir, { recursive: true });

  const entryPoints: Record<string, string> = {};

  for (const name of STORY_COMPONENTS) {
    const filePath = path.join(mocksDir, `${name}.tsx`);
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Story component source file not found: ${filePath}\n` +
          `Ensure the file exists in ${mocksDir} and the name in STORY_COMPONENTS is correct.`,
      );
    }
    entryPoints[name] = filePath;
  }

  const buildOptions = createFrontComponentBuildOptions({
    entryPoints,
    outdir: outputDir,
    tsconfigPath: path.join(sdkRoot, 'tsconfig.json'),
  });

  await esbuild.build(buildOptions);

  console.log(
    `Built ${STORY_COMPONENTS.length} story components to ${outputDir}`,
  );
};

buildMockComponents().catch((error) => {
  console.error('Failed to build mock components:', error);
  process.exit(1);
});

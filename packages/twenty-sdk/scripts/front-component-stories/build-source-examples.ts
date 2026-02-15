import * as esbuild from 'esbuild';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createFrontComponentBuildOptions } from './utils/create-front-component-build-options';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const exampleSourcesDir = path.resolve(
  dirname,
  '../../src/front-component-renderer/__stories__/example-sources',
);
const exampleSourcesBuiltDir = path.resolve(
  dirname,
  '../../src/front-component-renderer/__stories__/example-sources-built',
);
const exampleSourcesBuiltPreactDir = path.resolve(
  dirname,
  '../../src/front-component-renderer/__stories__/example-sources-built-preact',
);

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

const resolveEntryPoints = (): Record<string, string> => {
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

  return entryPoints;
};

type BundleSizeEntry = {
  name: string;
  reactBytes: number;
  preactBytes: number;
};

const collectBundleSizes = (): BundleSizeEntry[] =>
  STORY_COMPONENTS.map((name) => {
    const reactFile = path.join(exampleSourcesBuiltDir, `${name}.mjs`);
    const preactFile = path.join(
      exampleSourcesBuiltPreactDir,
      `${name}.mjs`,
    );

    return {
      name,
      reactBytes: fs.existsSync(reactFile)
        ? fs.statSync(reactFile).size
        : 0,
      preactBytes: fs.existsSync(preactFile)
        ? fs.statSync(preactFile).size
        : 0,
    };
  });

export const buildSourceExamples = async (): Promise<void> => {
  const entryPoints = resolveEntryPoints();
  const tsconfigPath = path.join(dirname, '../../tsconfig.json');

  // Build React variants
  fs.mkdirSync(exampleSourcesBuiltDir, { recursive: true });

  const reactBuildOptions = createFrontComponentBuildOptions({
    entryPoints,
    outdir: exampleSourcesBuiltDir,
    tsconfigPath,
  });

  await esbuild.build(reactBuildOptions);

  console.log(
    `Built ${STORY_COMPONENTS.length} React story components to ${exampleSourcesBuiltDir}`,
  );

  // Build Preact variants
  fs.mkdirSync(exampleSourcesBuiltPreactDir, { recursive: true });

  const preactBuildOptions = createFrontComponentBuildOptions({
    entryPoints,
    outdir: exampleSourcesBuiltPreactDir,
    tsconfigPath,
    usePreact: true,
  });

  await esbuild.build(preactBuildOptions);

  console.log(
    `Built ${STORY_COMPONENTS.length} Preact story components to ${exampleSourcesBuiltPreactDir}`,
  );

  // Write bundle-sizes manifest for the Storybook size story
  const sizes = collectBundleSizes();
  const manifestPath = path.join(exampleSourcesBuiltDir, 'bundle-sizes.json');

  fs.writeFileSync(manifestPath, JSON.stringify(sizes, null, 2));
  console.log(`Wrote bundle size manifest to ${manifestPath}`);
};

buildSourceExamples().catch((error) => {
  console.error('Failed to build mock components:', error);
  process.exit(1);
});

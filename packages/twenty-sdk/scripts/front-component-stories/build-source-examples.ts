import * as esbuild from 'esbuild';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createFrontComponentBuildOptions } from '../../src/cli/utilities/build/common/front-component-build/utils/create-front-component-build-options';
import { createTreeShakeIndividualBuildsPlugin } from '../../src/cli/utilities/build/common/front-component-build/tree-shake-individual-builds-plugin';

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

const rootNodeModules = path.resolve(dirname, '../../../../node_modules');

const twentyUiIndividualIndex = path.resolve(
  dirname,
  '../../../twenty-ui/dist/individual/individual-entry.js',
);

const sdkIndividualIndex = path.resolve(
  dirname,
  '../../dist/sdk/index.js',
);

const twentySharedIndividualDir = path.resolve(
  dirname,
  '../../../twenty-shared/dist/individual',
);

const TWENTY_SHARED_SUBMODULES = [
  'ai',
  'application',
  'constants',
  'database-events',
  'metadata',
  'testing',
  'translations',
  'types',
  'utils',
  'workflow',
  'workspace',
];

const twentySharedAliases = Object.fromEntries(
  TWENTY_SHARED_SUBMODULES.map((submodule) => [
    `twenty-shared/${submodule}`,
    path.join(twentySharedIndividualDir, submodule, 'index.js'),
  ]),
);

const sdkIndividualDir = path.resolve(dirname, '../../dist/sdk');
const twentyUiIndividualDir = path.resolve(
  dirname,
  '../../../twenty-ui/dist/individual',
);

const treeShakePlugin = createTreeShakeIndividualBuildsPlugin([
  sdkIndividualDir,
  twentySharedIndividualDir,
  twentyUiIndividualDir,
]);

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
  'sdk-context-example.front-component',
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

const buildSourceExamples = async (): Promise<void> => {
  const entryPoints = resolveEntryPoints();
  const tsconfigPath = path.join(dirname, '../../tsconfig.json');

  fs.mkdirSync(exampleSourcesBuiltDir, { recursive: true });

  await esbuild.build(
    createFrontComponentBuildOptions({
      entryPoints,
      outdir: exampleSourcesBuiltDir,
      tsconfigPath,
      minify: true,
      alias: {
        react: path.join(rootNodeModules, 'react'),
        'react-dom': path.join(rootNodeModules, 'react-dom'),
        '@/sdk': sdkIndividualIndex,
        'twenty-sdk/ui': twentyUiIndividualIndex,
        ...twentySharedAliases,
      },
      plugins: [treeShakePlugin],
    }),
  );

  console.log(
    `Built ${STORY_COMPONENTS.length} React story components to ${exampleSourcesBuiltDir}`,
  );

  fs.mkdirSync(exampleSourcesBuiltPreactDir, { recursive: true });

  await esbuild.build(
    createFrontComponentBuildOptions({
      entryPoints,
      outdir: exampleSourcesBuiltPreactDir,
      tsconfigPath,
      usePreact: true,
      minify: true,
      alias: {
        react: path.join(rootNodeModules, 'react'),
        'react-dom': path.join(rootNodeModules, 'react-dom'),
        '@/sdk': sdkIndividualIndex,
        'twenty-sdk/ui': twentyUiIndividualIndex,
        ...twentySharedAliases,
      },
      plugins: [treeShakePlugin],
    }),
  );

  console.log(
    `Built ${STORY_COMPONENTS.length} Preact story components to ${exampleSourcesBuiltPreactDir}`,
  );

  const sizes = collectBundleSizes();
  const manifestPath = path.join(exampleSourcesBuiltDir, 'bundle-sizes.json');

  fs.writeFileSync(manifestPath, JSON.stringify(sizes, null, 2));
  console.log(`Wrote bundle size manifest to ${manifestPath}`);
};

buildSourceExamples().catch((error) => {
  console.error('Failed to build mock components:', error);
  process.exit(1);
});

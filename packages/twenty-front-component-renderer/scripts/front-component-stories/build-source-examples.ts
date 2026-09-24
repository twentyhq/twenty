import * as esbuild from 'esbuild';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getFrontComponentBuildPlugins } from 'twenty-sdk/front-component-renderer/build';

import twentyUiPackageJson from '../../../twenty-ui/package.json';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const storiesDir = path.resolve(dirname, '../../src/__stories__');
const exampleSourcesBuiltDir = path.resolve(
  dirname,
  '../../src/__stories__/example-sources-built',
);
const exampleSourcesBuiltPreactDir = path.resolve(
  dirname,
  '../../src/__stories__/example-sources-built-preact',
);

const SOURCE_SCAN_ROOTS = [
  'html-tag',
  'host-api',
  'media',
  'showcase',
  'twenty-ui-gallery',
];

const rootNodeModules = path.resolve(dirname, '../../../../node_modules');

const twentyUiIndividualDir = path.resolve(
  dirname,
  '../../../twenty-ui/dist/individual',
);

const twentyUiIndividualIndex = path.join(
  twentyUiIndividualDir,
  'individual-entry.js',
);

const sdkDefineIndex = path.resolve(
  dirname,
  '../../../twenty-sdk/dist/define/index.mjs',
);

const sdkFrontComponentIndex = path.resolve(
  dirname,
  '../../../twenty-sdk/dist/front-component/index.mjs',
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

const twentyUiSubmodules = Object.keys(twentyUiPackageJson.exports)
  .filter((subpath) => subpath !== '.' && !subpath.endsWith('.css'))
  .map((subpath) => subpath.slice(2));

const twentyUiAliases = {
  'twenty-ui/style.css': path.join(twentyUiIndividualDir, 'twenty-ui.css'),
  'twenty-ui': twentyUiIndividualIndex,
  ...Object.fromEntries(
    twentyUiSubmodules.map((submodule) => [
      `twenty-ui/${submodule}`,
      path.join(twentyUiIndividualDir, submodule, 'index.js'),
    ]),
  ),
};

const storyAlias = {
  react: path.join(rootNodeModules, 'react'),
  'react-dom': path.join(rootNodeModules, 'react-dom'),
  'twenty-sdk/define': sdkDefineIndex,
  'twenty-sdk/front-component': sdkFrontComponentIndex,
  ...twentyUiAliases,
  ...twentySharedAliases,
};

const ENTRY_POINT_PATTERN = /\.front-component\.tsx$/;

const findEntryPointFiles = (directory: string): string[] => {
  const result: string[] = [];

  if (!fs.existsSync(directory)) {
    return result;
  }

  for (const dirent of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, dirent.name);

    if (dirent.isDirectory()) {
      if (dirent.name === 'shared') {
        continue;
      }

      result.push(...findEntryPointFiles(absolutePath));
      continue;
    }

    if (!dirent.isFile()) {
      continue;
    }

    if (ENTRY_POINT_PATTERN.test(dirent.name)) {
      result.push(absolutePath);
    }
  }

  return result;
};

const resolveEntryPoints = (): Record<string, string> => {
  const files = SOURCE_SCAN_ROOTS.flatMap((root) =>
    findEntryPointFiles(path.join(storiesDir, root)),
  );

  const entryPoints: Record<string, string> = {};

  for (const filePath of files) {
    const basename = path.basename(filePath).replace(/\.tsx$/, '');

    if (entryPoints[basename] !== undefined) {
      throw new Error(
        `Duplicate front-component basename "${basename}" found at ${filePath} and ${entryPoints[basename]}`,
      );
    }

    entryPoints[basename] = filePath;
  }

  if (Object.keys(entryPoints).length === 0) {
    throw new Error(
      `No front-component source files found under ${storiesDir} (scanned: ${SOURCE_SCAN_ROOTS.join(', ')})`,
    );
  }

  return entryPoints;
};

const STORY_COMPONENTS = Object.keys(resolveEntryPoints());

type BundleSizeEntry = {
  name: string;
  reactBytes: number;
  preactBytes: number;
};

const collectBundleSizes = (): BundleSizeEntry[] =>
  STORY_COMPONENTS.map((name) => {
    const reactFile = path.join(exampleSourcesBuiltDir, `${name}.mjs`);
    const preactFile = path.join(exampleSourcesBuiltPreactDir, `${name}.mjs`);

    return {
      name,
      reactBytes: fs.existsSync(reactFile) ? fs.statSync(reactFile).size : 0,
      preactBytes: fs.existsSync(preactFile) ? fs.statSync(preactFile).size : 0,
    };
  });

const CHECKSUM_FIXTURE_COMPONENT = 'static.front-component';
const STALE_CHECKSUM_SEED = 'stale build';

type ChecksumFixtures = {
  matchingChecksum: string;
  staleChecksum: string;
};

// Serves the same built component under a sha256 file name that matches its
// bytes and under one that does not, so stories can exercise the renderer's
// checksum verification against real static responses.
const writeChecksumFixtures = (): ChecksumFixtures => {
  const builtSource = fs.readFileSync(
    path.join(exampleSourcesBuiltDir, `${CHECKSUM_FIXTURE_COMPONENT}.mjs`),
  );
  const fixtures = {
    matchingChecksum: createHash('sha256').update(builtSource).digest('hex'),
    staleChecksum: createHash('sha256')
      .update(STALE_CHECKSUM_SEED)
      .digest('hex'),
  };

  for (const checksum of Object.values(fixtures)) {
    fs.writeFileSync(
      path.join(exampleSourcesBuiltDir, `${checksum}.js`),
      builtSource,
    );
  }

  fs.writeFileSync(
    path.join(exampleSourcesBuiltDir, 'checksum-fixtures.json'),
    JSON.stringify(fixtures, null, 2),
  );

  return fixtures;
};

const buildSourceExamples = async (): Promise<void> => {
  const entryPoints = resolveEntryPoints();
  const tsconfigPath = path.join(dirname, '../../tsconfig.json');

  const commonOptions: esbuild.BuildOptions = {
    entryPoints,
    bundle: true,
    splitting: false,
    format: 'esm',
    outExtension: { '.js': '.mjs' },
    tsconfig: tsconfigPath,
    jsx: 'automatic',
    sourcemap: true,
    metafile: true,
    logLevel: 'silent',
    minify: true,
    alias: storyAlias,
  };

  fs.mkdirSync(exampleSourcesBuiltDir, { recursive: true });

  await esbuild.build({
    ...commonOptions,
    outdir: exampleSourcesBuiltDir,
    plugins: getFrontComponentBuildPlugins(),
  });

  console.log(
    `Built ${STORY_COMPONENTS.length} React story components to ${exampleSourcesBuiltDir}`,
  );

  fs.mkdirSync(exampleSourcesBuiltPreactDir, { recursive: true });

  await esbuild.build({
    ...commonOptions,
    outdir: exampleSourcesBuiltPreactDir,
    plugins: getFrontComponentBuildPlugins({ usePreact: true }),
  });

  console.log(
    `Built ${STORY_COMPONENTS.length} Preact story components to ${exampleSourcesBuiltPreactDir}`,
  );

  const sizes = collectBundleSizes();
  const manifestPath = path.join(exampleSourcesBuiltDir, 'bundle-sizes.json');

  fs.writeFileSync(manifestPath, JSON.stringify(sizes, null, 2));
  console.log(`Wrote bundle size manifest to ${manifestPath}`);

  const checksumFixtures = writeChecksumFixtures();

  console.log(
    `Wrote checksum fixtures ${checksumFixtures.matchingChecksum}.js and ${checksumFixtures.staleChecksum}.js to ${exampleSourcesBuiltDir}`,
  );
};

buildSourceExamples().catch((error) => {
  console.error('Failed to build mock components:', error);
  process.exit(1);
});

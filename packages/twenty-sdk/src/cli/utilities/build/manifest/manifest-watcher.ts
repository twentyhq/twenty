import chalk from 'chalk';
import chokidar, { type FSWatcher } from 'chokidar';
import * as fs from 'fs-extra';
import path from 'path';
import { type ApplicationManifest, type FrontComponentManifest, type ServerlessFunctionManifest } from 'twenty-shared/application';
import { OUTPUT_DIR } from '../common/constants';
import { FRONT_COMPONENTS_DIR } from '../front-components/constants';
import { FUNCTIONS_DIR } from '../functions/constants';
import {
  buildManifest,
  type BuildManifestResult,
} from './manifest-build';
import {
  displayEntitySummary,
  displayErrors,
  displayWarnings,
} from './manifest-display';
import { ManifestValidationError } from './manifest.types';

import {
  extractFrontComponentEntryPoints,
  extractFunctionEntryPoints,
  haveEntryPointsChanged,
} from '../common/entry-points';
import { computeFunctionOutputPath } from '../functions/function-paths';

export type ManifestBuildSuccess = {
  manifest: ApplicationManifest;
  functionsChanged: boolean;
  frontComponentsChanged: boolean;
};

export type ManifestWatcherCallbacks = {
  onBuildSuccess?: (result: ManifestBuildSuccess) => void;
};

const computeOutputPath = (sourcePath: string): string => {
  const normalizedPath = sourcePath.replace(/\\/g, '/');

  let relativePath = normalizedPath;
  if (relativePath.startsWith('src/app/')) {
    relativePath = relativePath.slice('src/app/'.length);
  } else if (relativePath.startsWith('src/')) {
    relativePath = relativePath.slice('src/'.length);
  }

  return relativePath.replace(/\.tsx?$/, '.js');
};

const removeOrphanedFiles = async (
  outputDir: string,
  expectedFiles: Set<string>,
): Promise<void> => {
  if (!(await fs.pathExists(outputDir))) {
    return;
  }

  const expectedFilesWithMaps = new Set<string>();
  for (const file of expectedFiles) {
    expectedFilesWithMaps.add(file);
    expectedFilesWithMaps.add(`${file}.map`);
  }

  const removeRecursively = async (dir: string, relativeBase: string = ''): Promise<void> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await removeRecursively(fullPath, relativePath);
        const remaining = await fs.readdir(fullPath);
        if (remaining.length === 0) {
          await fs.remove(fullPath);
        }
      } else if (entry.isFile()) {
        if (!expectedFilesWithMaps.has(relativePath)) {
          await fs.remove(fullPath);
        }
      }
    }
  };

  await removeRecursively(outputDir);
};

export const runManifestBuild = async (
  appPath: string,
  previousManifest: BuildManifestResult | null,
  callbacks: ManifestWatcherCallbacks = {},
): Promise<BuildManifestResult> => {
  console.log(chalk.blue('🔄 Building manifest...'));

  try {
    const { manifest, warnings } = await buildManifest(appPath);

    if (manifest) {
      displayEntitySummary(manifest);
    }
    displayWarnings(warnings);

    const functions = manifest?.serverlessFunctions ?? [];
    if (functions.length > 0) {
      console.log(chalk.gray(`  📍 Function entry points:`));
      for (const fn of functions) {
        const name = fn.name || fn.universalIdentifier;
        console.log(chalk.gray(`     - ${name} (${fn.handlerPath})`));
      }
    }

    const frontComponents = manifest?.frontComponents ?? [];
    if (frontComponents && frontComponents.length > 0) {
      console.log(chalk.gray(`  📍 Front component entry points:`));
      for (const component of frontComponents) {
        const name = component.name || component.universalIdentifier;
        console.log(chalk.gray(`     - ${name} (${component.componentPath})`));
      }
    }

    await writeManifestToOutput(appPath, manifest);

    const previousFunctions = previousManifest?.manifest.serverlessFunctions ?? [];
    const previousFrontComponents = previousManifest?.manifest.frontComponents ?? [];

    const previousFunctionEntryPoints = extractFunctionEntryPoints(previousFunctions);
    const newFunctionEntryPoints = extractFunctionEntryPoints(functions);
    const functionsChanged = haveEntryPointsChanged(
      previousFunctionEntryPoints,
      newFunctionEntryPoints,
    );
    const isInitialFunctionBuild = previousFunctionEntryPoints.length === 0;

    const previousFrontComponentEntryPoints = extractFrontComponentEntryPoints(previousFrontComponents);
    const newFrontComponentEntryPoints = extractFrontComponentEntryPoints(frontComponents);
    const frontComponentsChanged = haveEntryPointsChanged(
      previousFrontComponentEntryPoints,
      newFrontComponentEntryPoints,
    );
    const isInitialFrontComponentBuild = previousFrontComponentEntryPoints.length === 0;

    if (functionsChanged && !isInitialFunctionBuild) {
      await cleanupOldFunctionsFromManifest(appPath, functions);
    }

    if (frontComponentsChanged && !isInitialFrontComponentBuild) {
      await cleanupOldFrontComponentsFromManifest(appPath, frontComponents ?? []);
    }

    if (callbacks.onBuildSuccess && !isInitialFunctionBuild && !isInitialFrontComponentBuild) {
      callbacks.onBuildSuccess({
        manifest: result.manifest,
        functionsChanged,
        frontComponentsChanged,
      });
    }

    return result;
  } catch (error) {
    if (error instanceof ManifestValidationError) {
      displayErrors(error);
    } else {
      console.error(
        chalk.red('  ✗ Build failed:'),
        error instanceof Error ? error.message : error,
      );
    }
    throw error;
  }
};

const writeManifestToOutput = async (
  appPath: string,
  result: BuildManifestResult,
): Promise<void> => {
  try {
    const outputDir = path.join(appPath, OUTPUT_DIR);
    await fs.ensureDir(outputDir);

    const manifestPath = path.join(outputDir, 'manifest.json');
    await fs.writeJSON(manifestPath, result.manifest, { spaces: 2 });

    console.log(chalk.green(`  ✓ Manifest written to ${manifestPath}`));
  } catch (error) {
    console.error(
      chalk.red('  ✗ Failed to write manifest:'),
      error instanceof Error ? error.message : error,
    );
  }
};

export type ManifestWatcher = FSWatcher;

export type CreateManifestWatcherOptions = {
  appPath: string;
  initialManifest: ApplicationManifest;
  callbacks?: ManifestWatcherCallbacks;
};

export const createManifestWatcher = (
  options: CreateManifestWatcherOptions,
): ManifestWatcher => {
  const { appPath, callbacks = {} } = options;
  let currentManifest = options.initialManifest;

  const watchPatterns = [
    path.join(appPath, 'src/**/*.ts'),
    path.join(appPath, 'src/**/*.tsx'),
    path.join(appPath, 'src/**/*.json'),
  ];

  const watcher = chokidar.watch(watchPatterns, {
    ignored: [
      '**/node_modules/**',
      '**/.twenty/**',
      '**/dist/**',
      '**/*.d.ts',
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  });

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const handleChange = async () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      const newManifest = await runManifestBuild(appPath, currentManifest, callbacks);
      if (newManifest) {
        currentManifest = newManifest;
      }
    }, 150);
  };

  watcher.on('add', handleChange);
  watcher.on('change', handleChange);
  watcher.on('unlink', handleChange);

  return watcher;
};

export const cleanupOldFunctionsFromManifest = async (
  appPath: string,
  functions: ServerlessFunctionManifest[],
): Promise<void> => {
  const outputDir = path.join(appPath, OUTPUT_DIR, FUNCTIONS_DIR);
  const expectedFiles = new Set(
    functions.map((fn) => computeFunctionOutputPath(fn.handlerPath).relativePath),
  );
  await removeOrphanedFiles(outputDir, expectedFiles);
};

export const cleanupOldFrontComponentsFromManifest = async (
  appPath: string,
  components: FrontComponentManifest[],
): Promise<void> => {
  const outputDir = path.join(appPath, OUTPUT_DIR, FRONT_COMPONENTS_DIR);
  const expectedFiles = new Set(
    components.map((c) => computeOutputPath(c.componentPath)),
  );
  await removeOrphanedFiles(outputDir, expectedFiles);
};

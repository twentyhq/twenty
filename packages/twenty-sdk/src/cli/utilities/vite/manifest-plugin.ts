import { OUTPUT_DIR } from '@/cli/constants/output-dir';
import { ManifestValidationError } from '@/cli/utilities/manifest/types/manifest.types';
import {
  buildManifest,
  type BuildManifestResult,
} from '@/cli/utilities/manifest/utils/manifest-build';
import {
  displayEntitySummary,
  displayErrors,
  displayWarnings,
} from '@/cli/utilities/manifest/utils/manifest-display';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import path from 'path';
import { type Plugin } from 'vite';

import {
  extractFunctionEntryPoints,
  haveFunctionEntryPointsChanged,
} from './entry-points';
import { buildFunctionInput } from './function-paths';

export type ManifestPluginCallbacks = {
  onEntryPointsChange?: (entryPoints: string[]) => void;
};

export type ManifestPluginState = {
  currentEntryPoints: string[];
};

/**
 * Creates a Vite plugin that rebuilds the manifest on file changes.
 * Works with Vite build watch mode.
 */
export const createManifestPlugin = (
  appPath: string,
  state: ManifestPluginState,
  callbacks: ManifestPluginCallbacks = {},
): Plugin => {
  const isRelevantFile = (file: string): boolean => {
    return ['.ts', '.json'].some((ext) => file.endsWith(ext));
  };

  return {
    name: 'twenty-manifest',

    // Called when a watched file changes (build watch mode)
    watchChange: async (id, change) => {
      if (isRelevantFile(id)) {
        // Rebuild manifest when files change
        await runManifestBuild(appPath, state, callbacks);
      }
    },
  };
};

/**
 * Builds the manifest and returns function input for Vite.
 * Also handles entry point change detection.
 */
export const runManifestBuild = async (
  appPath: string,
  state: ManifestPluginState,
  callbacks: ManifestPluginCallbacks = {},
): Promise<Record<string, string>> => {
  console.log(chalk.blue('🔄 Building manifest...'));

  try {
    const result = await buildManifest(appPath);

    displayEntitySummary(result.manifest);
    displayWarnings(result.warnings);

    const functions = result.manifest.serverlessFunctions;
    if (functions.length > 0) {
      console.log(chalk.gray(`  📍 Function entry points:`));
      for (const fn of functions) {
        const name = fn.name || fn.universalIdentifier;
        console.log(chalk.gray(`     - ${name} (${fn.handlerPath})`));
      }
    }

    await writeManifestToOutput(appPath, result);

    // Check if entry points changed
    const newEntryPoints = extractFunctionEntryPoints(functions);
    const entryPointsChanged = haveFunctionEntryPointsChanged(
      state.currentEntryPoints,
      newEntryPoints,
    );

    const isInitialBuild = state.currentEntryPoints.length === 0;
    state.currentEntryPoints = newEntryPoints;

    if (entryPointsChanged && !isInitialBuild && callbacks.onEntryPointsChange) {
      callbacks.onEntryPointsChange(newEntryPoints);
    }

    return buildFunctionInput(appPath, functions);
  } catch (error) {
    if (error instanceof ManifestValidationError) {
      displayErrors(error);
    } else {
      console.error(
        chalk.red('  ✗ Build failed:'),
        error instanceof Error ? error.message : error,
      );
    }
    return {};
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

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

const PLUGIN_NAME = 'twenty-manifest';

export type ManifestPluginOptions = {
  appPath: string;
  onFunctionEntryPointsChange?: (entryPoints: string[]) => void;
};

/**
 * Creates a Vite plugin that builds the application manifest on startup
 * and rebuilds it when source files change.
 *
 * Handles:
 * - Building the manifest
 * - Displaying build status, entity summary, and warnings/errors
 * - Writing manifest to output directory
 * - Tracking serverless function entry points and notifying when they change
 */
export const createManifestPlugin = (
  options: ManifestPluginOptions,
): Plugin => {
  const { appPath, onFunctionEntryPointsChange } = options;

  // Track current function entry points to detect changes
  let currentFunctionEntryPoints: string[] = [];

  const handleBuildSuccess = async (result: BuildManifestResult): Promise<void> => {
    displayEntitySummary(result.manifest);
    displayWarnings(result.warnings);
    await writeManifestToOutput(result);
  };

  const handleBuildError = (error: Error): void => {
    if (error instanceof ManifestValidationError) {
      displayErrors(error);
    } else {
      console.error(chalk.red('  ✗ Build failed:'), error.message);
    }
  };

  const writeManifestToOutput = async (
    result: BuildManifestResult,
  ): Promise<void> => {
    try {
      const outputDir = path.join(appPath, OUTPUT_DIR);

      await fs.ensureDir(outputDir);

      const manifestPath = path.join(outputDir, 'manifest.json');

      await fs.writeJSON(manifestPath, result.manifest, { spaces: 2 });

      console.log(chalk.green(`  ✓ Manifest written to ${manifestPath}`));
      console.log('');
      console.log(
        chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'),
      );
    } catch (error) {
      console.error(
        chalk.red('  ✗ Failed to write manifest:'),
        error instanceof Error ? error.message : error,
      );
    }
  };

  const runBuild = async (): Promise<void> => {
    console.log(chalk.blue('🔄 Building manifest...'));

    try {
      const result = await buildManifest(appPath);

      const newEntryPoints = extractFunctionEntryPoints(
        result.manifest.serverlessFunctions,
      );

      // Check if function entry points changed
      const entryPointsChanged = haveFunctionEntryPointsChanged(
        currentFunctionEntryPoints,
        newEntryPoints,
      );

      // Update tracked entry points
      currentFunctionEntryPoints = newEntryPoints;

      await handleBuildSuccess(result);

      // Notify if entry points changed (after success handling)
      if (entryPointsChanged && onFunctionEntryPointsChange) {
        onFunctionEntryPointsChange(newEntryPoints);
      }
    } catch (error) {
      handleBuildError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  return {
    name: PLUGIN_NAME,

    buildStart: async () => {
      await runBuild();
    },

    handleHotUpdate: async ({ file }) => {
      const relevantExtensions = ['.ts', '.json'];
      const isRelevantFile = relevantExtensions.some((ext) =>
        file.endsWith(ext),
      );

      if (isRelevantFile) {
        await runBuild();
      }

      return [];
    },
  };
};

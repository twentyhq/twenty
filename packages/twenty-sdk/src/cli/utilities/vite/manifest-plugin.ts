import { ManifestValidationError } from '@/cli/utilities/manifest/types/manifest.types';
import {
  buildManifest,
  type BuildManifestResult,
} from '@/cli/utilities/manifest/utils/manifest-build';
import { type Plugin } from 'vite';

import {
  extractFunctionEntryPoints,
  haveFunctionEntryPointsChanged,
} from './entry-points';

const PLUGIN_NAME = 'twenty-manifest';

export type ManifestBuildError = {
  message: string;
  errors?: Array<{ path: string; message: string }>;
};

export type ManifestPluginOptions = {
  appPath: string;
  onBuildStart?: () => void;
  onBuildSuccess?: (result: BuildManifestResult) => void;
  onBuildError?: (error: ManifestBuildError) => void;
  onFunctionEntryPointsChange?: (entryPoints: string[]) => void;
};

/**
 * Creates a Vite plugin that builds the application manifest on startup
 * and rebuilds it when source files change.
 *
 * Tracks serverless function entry points and notifies when the list changes.
 */
export const createManifestPlugin = (
  options: ManifestPluginOptions,
): Plugin => {
  const {
    appPath,
    onBuildStart,
    onBuildSuccess,
    onBuildError,
    onFunctionEntryPointsChange,
  } = options;

  // Track current function entry points to detect changes
  let currentFunctionEntryPoints: string[] = [];

  const runBuild = async (): Promise<void> => {
    onBuildStart?.();

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

      onBuildSuccess?.(result);

      // Notify if entry points changed (after success callback)
      if (entryPointsChanged && onFunctionEntryPointsChange) {
        onFunctionEntryPointsChange(newEntryPoints);
      }
    } catch (error) {
      const buildError: ManifestBuildError = {
        message: error instanceof Error ? error.message : String(error),
      };

      if (error instanceof ManifestValidationError) {
        buildError.errors = error.errors;
      }

      onBuildError?.(buildError);
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

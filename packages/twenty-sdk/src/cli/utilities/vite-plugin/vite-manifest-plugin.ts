import { ManifestValidationError } from '@/cli/utilities/manifest/types/manifest.types';
import {
  buildManifest,
  type BuildManifestResult,
} from '@/cli/utilities/manifest/utils/manifest-build';
import { type Plugin } from 'vite';

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
};

/**
 * Creates a Vite plugin that builds the application manifest on startup
 * and rebuilds it when source files change.
 */
export const createManifestPlugin = (
  options: ManifestPluginOptions,
): Plugin => {
  const { appPath, onBuildStart, onBuildSuccess, onBuildError } = options;

  const runBuild = async (): Promise<void> => {
    onBuildStart?.();

    try {
      const result = await buildManifest(appPath);

      onBuildSuccess?.(result);
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

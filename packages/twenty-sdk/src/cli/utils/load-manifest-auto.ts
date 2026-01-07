import chalk from 'chalk';
import {
  type ApplicationManifest,
  type PackageJson,
} from 'twenty-shared/application';
import { loadManifest as loadManifestLegacy } from './load-manifest';
import {
  loadManifestV2,
  hasNewFolderStructure,
  type LoadManifestV2Result,
} from './load-manifest-v2';
import { type ValidationWarning } from './validate-manifest';

export type LoadManifestResult = {
  packageJson: PackageJson;
  yarnLock: string;
  manifest: ApplicationManifest;
  shouldGenerate: boolean;
  warnings?: ValidationWarning[];
  usedLoader: 'v2' | 'legacy';
};

/**
 * Automatically detect and use the appropriate manifest loader.
 *
 * - If `app/` folder exists → use new v2 loader (jiti-based)
 * - Otherwise → use legacy AST-based loader
 *
 * This allows gradual migration from the old decorator-based structure
 * to the new config-based structure.
 */
export const loadManifestAuto = async (
  appPath: string,
): Promise<LoadManifestResult> => {
  const hasNewStructure = await hasNewFolderStructure(appPath);

  if (hasNewStructure) {
    const result = await loadManifestV2(appPath);
    return {
      ...result,
      usedLoader: 'v2',
    };
  }

  // Use legacy loader with migration warning
  console.warn(
    chalk.yellow(
      '\n⚠ Using legacy manifest loader (AST-based).\n' +
        '  Consider migrating to the new app/ folder structure.\n' +
        '  See: https://docs.twenty.com/extensions/migration\n',
    ),
  );

  const result = await loadManifestLegacy(appPath);
  return {
    ...result,
    usedLoader: 'legacy',
  };
};

/**
 * Check which loader would be used for a given app path.
 */
export const detectLoaderType = async (
  appPath: string,
): Promise<'v2' | 'legacy'> => {
  const hasNewStructure = await hasNewFolderStructure(appPath);
  return hasNewStructure ? 'v2' : 'legacy';
};

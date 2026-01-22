import type * as esbuild from 'esbuild';
import path from 'path';
import { STATIC_ASSET_EXTENSIONS } from './constants';

export type AssetImport = {
  sourceAssetPath: string;
  entryPoint: string;
};

export type AssetTrackingResult = {
  assetImports: Map<string, AssetImport[]>;
};

// Escape special regex characters in a string
const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Creates an esbuild plugin that tracks asset imports and resolves them to the assets output
export const createAssetTrackingPlugin = (
  appPath: string,
  assetsOutputDir: string,
): {
  plugin: esbuild.Plugin;
  getAssetImports: () => Map<string, AssetImport[]>;
} => {
  // Map of entry point path -> list of asset imports
  const assetImports = new Map<string, AssetImport[]>();
  // Track current entry point during resolution
  let currentEntryPoint = '';

  // Build filter regex with properly escaped extensions
  const escapedExtensions = STATIC_ASSET_EXTENSIONS.map(escapeRegExp).join('|');
  const assetFilter = new RegExp(`(${escapedExtensions})$`, 'i');

  const plugin: esbuild.Plugin = {
    name: 'asset-tracking',
    setup: (build) => {
      // Track entry points
      build.onStart(() => {
        assetImports.clear();
      });

      // Intercept asset imports
      build.onResolve({ filter: assetFilter }, (args) => {
          // Determine which entry point this import belongs to
          const importer = args.importer || args.resolveDir;
          const entryPoint = findEntryPoint(importer, build.initialOptions.entryPoints);

          if (entryPoint) {
            currentEntryPoint = entryPoint;
          }

          // Resolve the asset path
          const resolvedPath = args.path.startsWith('.')
            ? path.resolve(args.resolveDir, args.path)
            : path.resolve(appPath, args.path);

          const sourceAssetPath = path.relative(appPath, resolvedPath);

          // Track this asset import
          if (currentEntryPoint) {
            const imports = assetImports.get(currentEntryPoint) ?? [];
            if (!imports.some((i) => i.sourceAssetPath === sourceAssetPath)) {
              imports.push({
                sourceAssetPath,
                entryPoint: currentEntryPoint,
              });
              assetImports.set(currentEntryPoint, imports);
            }
          }

          // Resolve to the asset in the output directory
          const assetFileName = path.basename(resolvedPath);
          const outputAssetPath = path.join(assetsOutputDir, assetFileName);

          return {
            path: outputAssetPath,
            external: true,
          };
        },
      );
    },
  };

  return {
    plugin,
    getAssetImports: () => assetImports,
  };
};

// Find which entry point a file belongs to by checking if the file is the entry point
// or if the file path is more specifically in the same directory as an entry point
const findEntryPoint = (
  filePath: string,
  entryPoints: esbuild.BuildOptions['entryPoints'],
): string | null => {
  if (!entryPoints) return null;

  const getEntryPaths = (): string[] => {
    if (Array.isArray(entryPoints)) {
      return entryPoints.map((entry) => (typeof entry === 'string' ? entry : entry.in));
    }
    return Object.values(entryPoints);
  };

  const entryPaths = getEntryPaths();

  // First, check for exact match (file is the entry point itself)
  for (const entryPath of entryPaths) {
    if (filePath === entryPath) {
      return entryPath;
    }
  }

  // Then, find the entry point with the most specific (longest) common path
  let bestMatch: string | null = null;
  let bestMatchLength = 0;

  for (const entryPath of entryPaths) {
    const entryDir = path.dirname(entryPath);
    if (filePath.startsWith(entryDir)) {
      if (entryDir.length > bestMatchLength) {
        bestMatch = entryPath;
        bestMatchLength = entryDir.length;
      }
    }
  }

  return bestMatch;
};

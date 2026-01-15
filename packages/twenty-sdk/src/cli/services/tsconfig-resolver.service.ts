import * as fs from 'fs-extra';
import * as path from 'path';
import { parse as parseJsonc } from 'jsonc-parser';

export type PathAlias = {
  pattern: string;
  paths: string[];
};

type TsConfig = {
  compilerOptions?: {
    baseUrl?: string;
    paths?: Record<string, string[]>;
  };
  extends?: string;
};

/**
 * Resolve TypeScript path aliases from tsconfig.json.
 *
 * This function reads the tsconfig.json file and extracts path aliases
 * defined in compilerOptions.paths. It also handles tsconfig inheritance
 * through the "extends" property.
 *
 * @example
 * // tsconfig.json
 * {
 *   "compilerOptions": {
 *     "baseUrl": ".",
 *     "paths": {
 *       "@/*": ["src/*"],
 *       "@utils/*": ["src/utils/*"]
 *     }
 *   }
 * }
 *
 * // Result:
 * [
 *   { pattern: "@/*", paths: ["/absolute/path/src/*"] },
 *   { pattern: "@utils/*", paths: ["/absolute/path/src/utils/*"] }
 * ]
 */
export const resolveTsconfigPaths = async (
  appPath: string,
): Promise<PathAlias[]> => {
  const tsconfigPath = path.join(appPath, 'tsconfig.json');

  if (!(await fs.pathExists(tsconfigPath))) {
    return [];
  }

  try {
    const config = await loadTsConfig(tsconfigPath, appPath);
    return extractPathAliases(config, appPath);
  } catch (error) {
    // If we can't parse tsconfig, return empty aliases
    console.warn(
      `Warning: Could not parse tsconfig.json: ${error instanceof Error ? error.message : String(error)}`,
    );
    return [];
  }
};

/**
 * Load a tsconfig.json file, handling "extends" inheritance.
 */
const loadTsConfig = async (
  tsconfigPath: string,
  appPath: string,
): Promise<TsConfig> => {
  const content = await fs.readFile(tsconfigPath, 'utf8');
  const config = parseJsonc(content) as TsConfig;

  // Handle inheritance
  if (config.extends) {
    const parentPath = resolveExtends(config.extends, tsconfigPath, appPath);
    if (await fs.pathExists(parentPath)) {
      const parentConfig = await loadTsConfig(parentPath, appPath);
      return mergeTsConfigs(parentConfig, config);
    }
  }

  return config;
};

/**
 * Resolve the path of an extended tsconfig.
 */
const resolveExtends = (
  extendsPath: string,
  currentConfigPath: string,
  appPath: string,
): string => {
  // If it starts with a package name (no ./ or ../)
  if (!extendsPath.startsWith('.')) {
    // Try to resolve from node_modules
    const nodeModulesPath = path.join(
      appPath,
      'node_modules',
      extendsPath,
    );
    // Check if it's a path to a specific file or a package
    if (extendsPath.endsWith('.json')) {
      return nodeModulesPath;
    }
    // Try package/tsconfig.json
    return path.join(nodeModulesPath, 'tsconfig.json');
  }

  // Relative path
  return path.resolve(path.dirname(currentConfigPath), extendsPath);
};

/**
 * Merge two tsconfig objects, with child overriding parent.
 */
const mergeTsConfigs = (parent: TsConfig, child: TsConfig): TsConfig => {
  return {
    ...parent,
    ...child,
    compilerOptions: {
      ...parent.compilerOptions,
      ...child.compilerOptions,
      // Merge paths objects
      paths: {
        ...parent.compilerOptions?.paths,
        ...child.compilerOptions?.paths,
      },
    },
  };
};

/**
 * Extract path aliases from a tsconfig object.
 */
const extractPathAliases = (config: TsConfig, appPath: string): PathAlias[] => {
  const { compilerOptions } = config;

  if (!compilerOptions?.paths) {
    return [];
  }

  const baseUrl = compilerOptions.baseUrl
    ? path.resolve(appPath, compilerOptions.baseUrl)
    : appPath;

  const aliases: PathAlias[] = [];

  for (const [pattern, relativePaths] of Object.entries(compilerOptions.paths)) {
    const absolutePaths = relativePaths.map((p) => path.resolve(baseUrl, p));
    aliases.push({ pattern, paths: absolutePaths });
  }

  return aliases;
};

/**
 * Create an esbuild-compatible alias map from path aliases.
 *
 * This converts TypeScript path aliases to a format that can be used
 * with esbuild's alias option or a custom resolver plugin.
 */
export const createEsbuildAliasMap = (
  aliases: PathAlias[],
): Record<string, string> => {
  const aliasMap: Record<string, string> = {};

  for (const alias of aliases) {
    // For simple aliases without wildcards
    if (!alias.pattern.includes('*') && alias.paths[0]) {
      aliasMap[alias.pattern] = alias.paths[0];
    }
  }

  return aliasMap;
};

import type { FrontComponentConfig, FunctionConfig } from '@/application';
import * as fs from 'fs-extra';
import { createJiti } from 'jiti';
import { type JitiOptions } from 'jiti/lib/types';
import path from 'path';
import {
  type FrontComponentManifest,
  type ServerlessFunctionManifest,
} from 'twenty-shared/application';
import { fileURLToPath } from 'url';
import { parseJsoncFile } from './file-jsonc';

type ExtractOptions = {
  propertyName: string;
  entityType: string;
  jsx?: boolean;
};

const getTsconfigAliases = async (
  appPath: string,
): Promise<Record<string, string>> => {
  const tsconfigPath = path.join(appPath, 'tsconfig.json');

  if (!(await fs.pathExists(tsconfigPath))) {
    return {};
  }

  try {
    const tsconfig = await parseJsoncFile(tsconfigPath);
    const paths = tsconfig?.compilerOptions?.paths as
      | Record<string, string[]>
      | undefined;
    const baseUrl = (tsconfig?.compilerOptions?.baseUrl as string) || '.';

    if (!paths) {
      return {};
    }

    const aliases: Record<string, string> = {};

    for (const [pattern, targets] of Object.entries(paths)) {
      if (targets.length === 0) continue;

      const aliasKey = pattern.replace(/\/\*$/, '');
      const targetPath = targets[0].replace(/\/\*$/, '');
      const resolvedTarget = path.resolve(appPath, baseUrl, targetPath);
      aliases[aliasKey] = resolvedTarget;
    }

    return aliases;
  } catch {
    return {};
  }
};

const createConfigLoader = async (
  appPath?: string,
  options: { jsx?: boolean } = {},
) => {
  const basePath = appPath ?? fileURLToPath(import.meta.url);

  const jitiOptions: JitiOptions = {
    moduleCache: false,
    fsCache: false,
    interopDefault: true,
  };

  if (options.jsx) {
    jitiOptions.jsx = { runtime: 'automatic' };
  }

  if (appPath) {
    const aliases = await getTsconfigAliases(appPath);
    if (Object.keys(aliases).length > 0) {
      jitiOptions.alias = aliases;
    }
  }

  return createJiti(basePath, jitiOptions);
};

const findConfigExport = <T>(
  mod: Record<string, unknown>,
  validator?: (value: unknown) => boolean,
): T | undefined => {
  if (mod.default !== undefined) {
    if (!validator || validator(mod.default)) {
      return mod.default as T;
    }
  }

  for (const [key, value] of Object.entries(mod)) {
    if (key === 'default') continue;
    if (value === undefined || value === null) continue;
    if (typeof value !== 'object') continue;
    if (Array.isArray(value)) continue;

    if (!validator || validator(value)) {
      return value as T;
    }
  }

  return undefined;
};

export const loadConfig = async <T>(
  filepath: string,
  appPath?: string,
): Promise<T> => {
  const jiti = await createConfigLoader(appPath);

  try {
    const mod = (await jiti.import(filepath)) as Record<string, unknown>;
    const config = findConfigExport<T>(mod);

    if (!config) {
      throw new Error(
        `Config file ${filepath} must export a config object (default export or any named object export)`,
      );
    }

    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to load config from ${filepath}: ${error.message}`,
      );
    }
    throw error;
  }
};

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const extractImportPath = (
  source: string,
  identifier: string,
  filepath: string,
  appPath: string,
): string | null => {
  const escapedIdentifier = escapeRegExp(identifier);

  const patterns = [
    new RegExp(
      `import\\s*\\{[^}]*\\b${escapedIdentifier}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
    ),
    new RegExp(
      `import\\s*\\{[^}]*\\w+\\s+as\\s+${escapedIdentifier}[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
    ),
    new RegExp(`import\\s+${escapedIdentifier}\\s+from\\s*['"]([^'"]+)['"]`),
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);

    if (match) {
      const importPath = match[1];
      const fileDir = path.dirname(filepath);
      const absolutePath = path.resolve(fileDir, importPath);
      const relativePath = path.relative(appPath, absolutePath);

      const resultPath = relativePath.endsWith('.ts')
        ? relativePath
        : `${relativePath}.ts`;

      return resultPath.replace(/\\/g, '/');
    }
  }

  return null;
};

const extractConfigFromFile = async <T extends Record<string, unknown>>(
  filepath: string,
  appPath: string,
  options: ExtractOptions,
): Promise<{ config: T; entryName: string; entryPath: string }> => {
  const { propertyName, entityType, jsx } = options;
  const jiti = await createConfigLoader(appPath, { jsx });

  try {
    const mod = (await jiti.import(filepath)) as Record<string, unknown>;

    const hasProperty = (value: unknown): boolean => {
      return (
        typeof value === 'object' &&
        value !== null &&
        propertyName in value &&
        typeof (value as Record<string, unknown>)[propertyName] === 'function'
      );
    };

    const config = findConfigExport<T & Record<string, Function>>(
      mod,
      hasProperty,
    );

    if (!config) {
      throw new Error(
        `${entityType} file ${filepath} must export a config object with a "${propertyName}" property`,
      );
    }

    const entryName = config[propertyName].name;

    if (!entryName) {
      throw new Error(
        `${propertyName} function in ${filepath} must be a named function`,
      );
    }

    const source = await fs.readFile(filepath, 'utf8');
    const importPath = extractImportPath(source, entryName, filepath, appPath);
    const entryPath =
      importPath ?? path.relative(appPath, filepath).replace(/\\/g, '/');

    return { config, entryName, entryPath };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to load ${entityType.toLowerCase()} module from ${filepath}: ${error.message}`,
      );
    }
    throw error;
  }
};

export const extractFunctionConfig = async (
  filepath: string,
  appPath: string,
): Promise<ServerlessFunctionManifest> => {
  const { config, entryName, entryPath } =
    await extractConfigFromFile<FunctionConfig>(filepath, appPath, {
      propertyName: 'handler',
      entityType: 'Function',
    });

  return {
    universalIdentifier: config.universalIdentifier,
    name: config.name,
    description: config.description,
    timeoutSeconds: config.timeoutSeconds,
    triggers: config.triggers ?? [],
    handlerName: entryName,
    handlerPath: entryPath,
  };
};

export const extractFrontComponentConfig = async (
  filepath: string,
  appPath: string,
): Promise<FrontComponentManifest> => {
  const { config, entryName, entryPath } =
    await extractConfigFromFile<FrontComponentConfig>(filepath, appPath, {
      propertyName: 'component',
      entityType: 'Front component',
      jsx: true,
    });

  return {
    universalIdentifier: config.universalIdentifier,
    name: config.name,
    description: config.description,
    componentName: entryName,
    componentPath: entryPath,
  };
};

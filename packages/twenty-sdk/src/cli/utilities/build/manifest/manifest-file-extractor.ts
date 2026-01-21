import * as fs from 'fs-extra';
import { createJiti } from 'jiti';
import { type JitiOptions } from 'jiti/lib/types';
import path from 'path';
import { parseJsoncFile } from '../../file/utils/file-jsonc';

export type ExtractManifestOptions = {
  jsx?: boolean;
  entryProperty?: string;
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

const createModuleLoader = async (
  appPath: string,
  options: { jsx?: boolean } = {},
) => {
  const jitiOptions: JitiOptions = {
    moduleCache: false,
    fsCache: false,
    interopDefault: true,
  };

  if (options.jsx) {
    jitiOptions.jsx = { runtime: 'automatic' };
  }

  const aliases = await getTsconfigAliases(appPath);

  if (Object.keys(aliases).length > 0) {
    jitiOptions.alias = aliases;
  }

  return createJiti(appPath, jitiOptions);
};

const findConfigInModule = <T>(
  module: Record<string, unknown>,
  validator?: (value: unknown) => boolean,
): T | undefined => {
  if (module.default !== undefined) {
    if (!validator || validator(module.default)) {
      return module.default as T;
    }
  }

  for (const [key, value] of Object.entries(module)) {
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

export const extractManifestFromFile = async <TManifest>(
  filepath: string,
  appPath: string,
  options: ExtractManifestOptions = {},
): Promise<TManifest> => {
  const { jsx, entryProperty } = options;
  const jiti = await createModuleLoader(appPath, { jsx });

  const module = (await jiti.import(filepath)) as Record<string, unknown>;

  const configValidator = entryProperty
    ? (value: unknown): boolean =>
        typeof value === 'object' &&
        value !== null &&
        entryProperty in value &&
        typeof (value as Record<string, unknown>)[entryProperty] === 'function'
    : undefined;

  const config = findConfigInModule<Record<string, unknown>>(
    module,
    configValidator,
  );

  if (!config) {
    const expectedExport = entryProperty
      ? `a config object with a "${entryProperty}" property`
      : 'a config object (default export or any named object export)';
    throw new Error(`Config file ${filepath} must export ${expectedExport}`);
  }

  if (!entryProperty) {
    return config as TManifest;
  }

  const entryFunction = config[entryProperty] as Function;
  const entryName = entryFunction.name;

  if (!entryName) {
    throw new Error(
      `${entryProperty} function in ${filepath} must be a named function`,
    );
  }

  const source = await fs.readFile(filepath, 'utf8');
  const importPath = extractImportPath(source, entryName, filepath, appPath);
  const entryPath =
    importPath ?? path.relative(appPath, filepath).replace(/\\/g, '/');

  const { [entryProperty]: _, ...configWithoutEntry } = config;

  const manifest = {
    ...configWithoutEntry,
    [`${entryProperty}Name`]: entryName,
    [`${entryProperty}Path`]: entryPath,
  };

  return manifest as TManifest;
};

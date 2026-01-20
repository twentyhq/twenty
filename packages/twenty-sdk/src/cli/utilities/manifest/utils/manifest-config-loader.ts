import * as fs from 'fs-extra';
import { createJiti } from 'jiti';
import { type JitiOptions } from 'jiti/lib/types';
import path from 'path';
import { parseJsoncFile } from '../../file/utils/file-jsonc';

export type ExtractConfigOptions<T> = {
  jsx?: boolean;
  entryProperty?: string;
  defaults?: Partial<T>;
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

export const extractConfigFromFile = async <T>(
  filepath: string,
  appPath: string,
  options: ExtractConfigOptions<T> = {},
): Promise<T> => {
  const { jsx, entryProperty, defaults } = options;
  const jiti = await createConfigLoader(appPath, { jsx });

  const mod = (await jiti.import(filepath)) as Record<string, unknown>;

  const validator = entryProperty
    ? (value: unknown): boolean =>
        typeof value === 'object' &&
        value !== null &&
        entryProperty in value &&
        typeof (value as Record<string, unknown>)[entryProperty] === 'function'
    : undefined;

  const config = findConfigExport<Record<string, unknown>>(mod, validator);

  if (!config) {
    const expectedExport = entryProperty
      ? `a config object with a "${entryProperty}" property`
      : 'a config object (default export or any named object export)';
    throw new Error(`Config file ${filepath} must export ${expectedExport}`);
  }

  if (!entryProperty) {
    return { ...defaults, ...config } as T;
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

  return {
    ...defaults,
    ...configWithoutEntry,
    [`${entryProperty}Name`]: entryName,
    [`${entryProperty}Path`]: entryPath,
  } as T;
};

import path from 'path';
import {
  closeViteServer,
  findImportSource,
  getViteServer,
  loadModule,
} from './vite-module-loader';

export type ExtractManifestOptions = {
  jsx?: boolean;
  entryProperty?: string;
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

export const extractManifestFromFile = async <TManifest>(
  filepath: string,
  appPath: string,
  options: ExtractManifestOptions = {},
): Promise<TManifest> => {
  const { entryProperty } = options;

  // Get or create the Vite server for this appPath
  const server = await getViteServer(appPath);

  // Load the module using Vite's SSR loader
  const module = await loadModule(server, filepath);

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

  // Use Vite to resolve where the function was imported from
  const importSource = await findImportSource(server, filepath, entryName, appPath);
  const entryPath =
    importSource ?? path.relative(appPath, filepath).replace(/\\/g, '/');

  const { [entryProperty]: _, ...configWithoutEntry } = config;

  const manifest = {
    ...configWithoutEntry,
    [`${entryProperty}Name`]: entryName,
    [`${entryProperty}Path`]: entryPath,
  };

  return manifest as TManifest;
};

// Re-export for cleanup
export { closeViteServer };

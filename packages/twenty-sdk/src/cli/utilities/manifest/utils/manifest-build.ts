import { type FrontComponentConfig } from '@/application/front-components/front-component-config';
import { type FunctionConfig } from '@/application/functions/function-config';
import { type RoleConfig } from '@/application/role-config';
import {
  loadConfig,
  loadFrontComponentModule,
  loadFunctionModule,
} from '@/cli/utilities/file/utils/file-config-loader';
import { findPathFile } from '@/cli/utilities/file/utils/file-find';
import { parseJsoncFile, parseTextFile } from '@/cli/utilities/file/utils/file-jsonc';
import { glob } from 'fast-glob';
import * as fs from 'fs-extra';
import path, { posix, relative, sep } from 'path';
import {
  type Application,
  type ApplicationManifest,
  type FrontComponentManifest,
  type ObjectExtensionManifest,
  type ObjectManifest,
  type PackageJson,
  type RoleManifest,
  type ServerlessFunctionManifest,
} from 'twenty-shared/application';
import { type Sources } from 'twenty-shared/types';
import {
  ManifestValidationError,
  type ValidationWarning,
} from '../types/manifest.types';
import { validateManifest } from './manifest-validate';

/**
 * Validate that the required folder structure exists.
 */
const validateFolderStructure = async (appPath: string): Promise<void> => {
  const appFolder = path.join(appPath, 'src', 'app');

  if (!(await fs.pathExists(appFolder))) {
    throw new Error(
      `Missing src/app/ folder in ${appPath}.\n` +
        'Create it with: mkdir -p src/app',
    );
  }

  const configFile = path.join(appPath, 'src', 'app', 'application.config.ts');
  if (!(await fs.pathExists(configFile))) {
    throw new Error('Missing src/app/application.config.ts');
  }
};

/**
 * Convert a file path to posix format relative to appPath.
 */
const toPosixRelative = (filepath: string, appPath: string): string => {
  const rel = relative(appPath, filepath);
  return rel.split(sep).join(posix.sep);
};

const loadFiles = async (
  patterns: string[],
  cwd: string,
): Promise<string[]> => {
  return glob(patterns, {
    cwd,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**'],
  });
};

/**
 * Load all object definitions from src/app/ (any *.object.ts file).
 */
const loadObjects = async (appPath: string): Promise<ObjectManifest[]> => {
  const objectFiles = await loadFiles(['src/app/**/*.object.ts'], appPath);

  const objects: ObjectManifest[] = [];

  for (const filepath of objectFiles) {
    try {
      const manifest = await loadConfig<ObjectManifest>(filepath, appPath);

      objects.push(manifest);
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load object from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return objects;
};

/**
 * Load all object extension definitions from src/app/ (any *.object-extension.ts file).
 */
const loadObjectExtensions = async (
  appPath: string,
): Promise<ObjectExtensionManifest[]> => {
  const extensionFiles = await loadFiles(
    ['src/app/**/*.object-extension.ts'],
    appPath,
  );

  const extensions: ObjectExtensionManifest[] = [];

  for (const filepath of extensionFiles) {
    try {
      const manifest = await loadConfig<ObjectExtensionManifest>(filepath, appPath);

      extensions.push(manifest);
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load object extension from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return extensions;
};

/**
 * Load all function definitions from src/app/ (any *.function.ts file).
 */
const loadFunctions = async (
  appPath: string,
): Promise<ServerlessFunctionManifest[]> => {
  const functionFiles = await loadFiles(['src/app/**/*.function.ts'], appPath);

  const functions: ServerlessFunctionManifest[] = [];

  for (const filepath of functionFiles) {
    try {
      const { config, handlerName, handlerPath } = await loadFunctionModule(
        filepath,
        appPath,
      );
      const fnConfig = config as FunctionConfig;

      const manifest: ServerlessFunctionManifest = {
        universalIdentifier: fnConfig.universalIdentifier,
        name: fnConfig.name,
        description: fnConfig.description,
        timeoutSeconds: fnConfig.timeoutSeconds,
        triggers: fnConfig.triggers ?? [],
        handlerPath,
        handlerName,
      };

      functions.push(manifest);
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load function from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return functions;
};

/**
 * Load all role definitions from src/app/ (any *.role.ts file).
 */
const loadRoles = async (appPath: string): Promise<RoleManifest[]> => {
  const roleFiles = await loadFiles(['src/app/**/*.role.ts'], appPath);

  const roles: RoleManifest[] = [];

  for (const filepath of roleFiles) {
    try {
      const config = await loadConfig<RoleConfig>(filepath, appPath);
      roles.push(config);
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load role from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return roles;
};

/**
 * Load all front component definitions from src/app/ (any *.front-component.tsx file).
 */
const loadFrontComponents = async (
  appPath: string,
): Promise<FrontComponentManifest[]> => {
  const componentFiles = await loadFiles(
    ['src/app/**/*.front-component.tsx'],
    appPath,
  );

  const components: FrontComponentManifest[] = [];

  for (const filepath of componentFiles) {
    try {
      const { config, componentName, componentPath } =
        await loadFrontComponentModule(filepath, appPath);
      const componentConfig = config as FrontComponentConfig;

      const manifest: FrontComponentManifest = {
        universalIdentifier: componentConfig.universalIdentifier,
        name: componentConfig.name,
        description: componentConfig.description,
        componentPath,
        componentName,
      };

      components.push(manifest);
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load front component from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return components;
};

/**
 * Build a nested object structure from all TypeScript source files.
 */
const loadSources = async (appPath: string): Promise<Sources> => {
  const sources: Sources = {};

  // Get all TypeScript files in src/ folder
  const tsFiles = await loadFiles(
    ['src/**/*.ts', 'generated/**/*.ts'],
    appPath,
  );

  for (const filepath of tsFiles) {
    const relPath = relative(appPath, filepath);
    const parts = relPath.split(sep);
    const content = await fs.readFile(filepath, 'utf8');

    // Build nested structure
    let current: Sources = sources;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = content;
      } else {
        current[part] = (current[part] ?? {}) as Sources;
        current = current[part] as Sources;
      }
    }
  }

  return sources;
};

/**
 * Check if the app imports from the generated folder.
 * Detects ESM imports: `import ... from '...generated'` or `import ... from '...generated/...'`
 * Detects CommonJS requires: `require('...generated')` or `require('...generated/...')`
 */
const checkShouldGenerate = async (appPath: string): Promise<boolean> => {
  const tsFiles = await loadFiles(['src/**/*.ts'], appPath);

  // Matches ESM: import ... from 'generated' or from '.../generated' or from '.../generated/...'
  const esmImportPattern =
    /from\s+['"][^'"]*\/generated(?:\/[^'"]*)?['"]|from\s+['"]generated['"]/;

  // Matches CommonJS: require('generated') or require('.../generated') or require('.../generated/...')
  const commonJsRequirePattern =
    /require\s*\(\s*['"][^'"]*\/generated(?:\/[^'"]*)?['"]\s*\)|require\s*\(\s*['"]generated['"]\s*\)/;

  for (const filepath of tsFiles) {
    const content = await fs.readFile(filepath, 'utf8');

    if (esmImportPattern.test(content) || commonJsRequirePattern.test(content)) {
      return true;
    }
  }

  return false;
};

export type BuildManifestResult = {
  packageJson: PackageJson;
  yarnLock: string;
  manifest: ApplicationManifest;
  shouldGenerate: boolean;
  warnings: ValidationWarning[];
};

/**
 * Build an application manifest using the folder structure with jiti runtime evaluation.
 */
export const buildManifest = async (
  appPath: string,
): Promise<BuildManifestResult> => {
  // Validate folder structure
  await validateFolderStructure(appPath);

  // Load package.json and yarn.lock
  const packageJson = await parseJsoncFile(
    await findPathFile(appPath, 'package.json'),
  );

  const yarnLock = await parseTextFile(
    await findPathFile(appPath, 'yarn.lock'),
  );

  // Load application config
  const applicationConfigPath = path.join(
    appPath,
    'src',
    'app',
    'application.config.ts',
  );
  const application = await loadConfig<Application>(applicationConfigPath, appPath);

  // Load all entities in parallel
  const [
    objects,
    objectExtensions,
    serverlessFunctions,
    frontComponents,
    roles,
    sources,
    shouldGenerate,
  ] = await Promise.all([
    loadObjects(appPath),
    loadObjectExtensions(appPath),
    loadFunctions(appPath),
    loadFrontComponents(appPath),
    loadRoles(appPath),
    loadSources(appPath),
    checkShouldGenerate(appPath),
  ]);

  // Build manifest
  const manifest: ApplicationManifest = {
    application,
    objects,
    objectExtensions:
      objectExtensions.length > 0 ? objectExtensions : undefined,
    serverlessFunctions,
    frontComponents: frontComponents.length > 0 ? frontComponents : undefined,
    roles,
    sources,
  };

  // Validate manifest
  const validation = validateManifest({
    application,
    objects,
    objectExtensions,
    serverlessFunctions,
    frontComponents,
    roles,
  });

  if (!validation.isValid) {
    throw new ManifestValidationError(validation.errors);
  }

  return {
    packageJson,
    yarnLock,
    manifest,
    shouldGenerate,
    warnings: validation.warnings,
  };
};

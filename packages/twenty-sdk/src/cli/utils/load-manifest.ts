import * as fs from 'fs-extra';
import { glob } from 'fast-glob';
import path, { posix, relative, sep } from 'path';
import {
  type Application,
  type ApplicationManifest,
  type ObjectManifest,
  type PackageJson,
  type RoleManifest,
  type ServerlessFunctionManifest,
} from 'twenty-shared/application';
import { type Sources } from 'twenty-shared/types';
import { type FunctionConfig } from '@/application/functions/function-config';
import { type RoleConfig } from '@/application/role-config';
import { loadConfig, loadFunctionModule } from './config-loader';
import { findPathFile } from './find-path-file';
import { parseJsoncFile, parseTextFile } from './jsonc-parser';
import {
  validateManifest,
  ManifestValidationError,
  type ValidationWarning,
} from './validate-manifest';

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
      const manifest = await loadConfig<ObjectManifest>(filepath);

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
      const config = await loadConfig<RoleConfig>(filepath);
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
 * Detects any `import ... from '...generated'` or `import ... from '...generated/...'` pattern.
 */
const checkShouldGenerate = async (appPath: string): Promise<boolean> => {
  const tsFiles = await loadFiles(['src/**/*.ts'], appPath);

  // Matches: import ... from 'generated' or from '.../generated' or from '.../generated/...'
  const generatedImportPattern =
    /from\s+['"][^'"]*\/generated(?:\/[^'"]*)?['"]|from\s+['"]generated['"]/;

  for (const filepath of tsFiles) {
    const content = await fs.readFile(filepath, 'utf8');

    if (generatedImportPattern.test(content)) {
      return true;
    }
  }

  return false;
};

export type LoadManifestResult = {
  packageJson: PackageJson;
  yarnLock: string;
  manifest: ApplicationManifest;
  shouldGenerate: boolean;
  warnings: ValidationWarning[];
};

/**
 * Load an application manifest using the folder structure with jiti runtime evaluation.
 *
 * Files are detected by their suffix (*.object.ts, *.function.ts, *.role.ts)
 * and can be placed anywhere within src/app/.
 *
 * Example structures:
 * ```
 * # Traditional (by type)
 * my-app/
 * ├── src/
 * │   └── app/
 * │       ├── application.config.ts
 * │       ├── objects/
 * │       │   └── postCard.object.ts
 * │       ├── functions/
 * │       │   └── createPostCard.function.ts
 * │       └── roles/
 * │           └── admin.role.ts
 *
 * # Feature-based
 * my-app/
 * ├── src/
 * │   └── app/
 * │       ├── application.config.ts
 * │       └── post-card/
 * │           ├── postCard.object.ts
 * │           ├── createPostCard.function.ts
 * │           └── postCardAdmin.role.ts
 * ```
 */
export const loadManifest = async (
  appPath: string,
): Promise<LoadManifestResult> => {
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
  const application = await loadConfig<Application>(applicationConfigPath);

  // Load all entities in parallel
  const [objects, serverlessFunctions, roles, sources, shouldGenerate] =
    await Promise.all([
      loadObjects(appPath),
      loadFunctions(appPath),
      loadRoles(appPath),
      loadSources(appPath),
      checkShouldGenerate(appPath),
    ]);

  // Build manifest
  const manifest: ApplicationManifest = {
    application,
    objects,
    serverlessFunctions,
    roles,
    sources,
  };

  // Validate manifest
  const validation = validateManifest({
    application,
    objects,
    serverlessFunctions,
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

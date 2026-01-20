import { findPathFile } from '@/cli/utilities/file/utils/file-find';
import {
  parseJsoncFile,
  parseTextFile,
} from '@/cli/utilities/file/utils/file-jsonc';
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
import { extractConfigFromFile } from './manifest-config-loader';
import { validateManifest } from './manifest-validate';

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

const loadObjects = async (appPath: string): Promise<ObjectManifest[]> => {
  const objectFiles = await loadFiles(['src/app/**/*.object.ts'], appPath);

  const objects: ObjectManifest[] = [];

  for (const filepath of objectFiles) {
    try {
      objects.push(
        await extractConfigFromFile<ObjectManifest>(filepath, appPath),
      );
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load object from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return objects;
};

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
      extensions.push(
        await extractConfigFromFile<ObjectExtensionManifest>(filepath, appPath),
      );
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load object extension from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return extensions;
};

const loadFunctions = async (
  appPath: string,
): Promise<ServerlessFunctionManifest[]> => {
  const functionFiles = await loadFiles(['src/app/**/*.function.ts'], appPath);

  const functions: ServerlessFunctionManifest[] = [];

  for (const filepath of functionFiles) {
    try {
      functions.push(
        await extractConfigFromFile<ServerlessFunctionManifest>(
          filepath,
          appPath,
          { entryProperty: 'handler', defaults: { triggers: [] } },
        ),
      );
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load function from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return functions;
};

const loadRoles = async (appPath: string): Promise<RoleManifest[]> => {
  const roleFiles = await loadFiles(['src/app/**/*.role.ts'], appPath);

  const roles: RoleManifest[] = [];

  for (const filepath of roleFiles) {
    try {
      roles.push(
        await extractConfigFromFile<RoleManifest>(filepath, appPath),
      );
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load role from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return roles;
};

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
      components.push(
        await extractConfigFromFile<FrontComponentManifest>(
          filepath,
          appPath,
          { entryProperty: 'component', jsx: true },
        ),
      );
    } catch (error) {
      const relPath = toPosixRelative(filepath, appPath);
      throw new Error(
        `Failed to load front component from ${relPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return components;
};

const loadSources = async (appPath: string): Promise<Sources> => {
  const sources: Sources = {};

  const tsFiles = await loadFiles(
    ['src/**/*.ts', 'generated/**/*.ts'],
    appPath,
  );

  for (const filepath of tsFiles) {
    const relPath = relative(appPath, filepath);
    const parts = relPath.split(sep);
    const content = await fs.readFile(filepath, 'utf8');

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

const checkShouldGenerate = async (appPath: string): Promise<boolean> => {
  const tsFiles = await loadFiles(['src/**/*.ts'], appPath);

  const esmImportPattern =
    /from\s+['"][^'"]*\/generated(?:\/[^'"]*)?['"]|from\s+['"]generated['"]/;

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

export const buildManifest = async (
  appPath: string,
): Promise<BuildManifestResult> => {
  await validateFolderStructure(appPath);

  const packageJson = await parseJsoncFile(
    await findPathFile(appPath, 'package.json'),
  );

  const yarnLock = await parseTextFile(
    await findPathFile(appPath, 'yarn.lock'),
  );

  const applicationConfigPath = path.join(
    appPath,
    'src',
    'app',
    'application.config.ts',
  );
  const application = await extractConfigFromFile<Application>(
    applicationConfigPath,
    appPath,
  );

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

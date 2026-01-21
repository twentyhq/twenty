import { findPathFile } from '@/cli/utilities/file/utils/file-find';
import { parseJsoncFile } from '@/cli/utilities/file/utils/file-jsonc';
import chalk from 'chalk';
import { glob } from 'fast-glob';
import * as fs from 'fs-extra';
import path, { relative, sep } from 'path';
import { type ApplicationManifest } from 'twenty-shared/application';
import { type Sources } from 'twenty-shared/types';
import { OUTPUT_DIR } from '../common/constants';
import { applicationEntityBuilder } from './entities/application';
import { frontComponentEntityBuilder } from './entities/front-component';
import { functionEntityBuilder } from './entities/function';
import { objectEntityBuilder } from './entities/object';
import { objectExtensionEntityBuilder } from './entities/object-extension';
import { roleEntityBuilder } from './entities/role';
import { displayEntitySummary, displayErrors, displayWarnings } from './manifest-display';
import { manifestExtractFromFileServer } from './manifest-extract-from-file-server';
import { validateManifest } from './manifest-validate';
import { ManifestValidationError } from './manifest.types';

export type EntityFilePaths = {
  application: string[];
  objects: string[];
  objectExtensions: string[];
  functions: string[];
  frontComponents: string[];
  roles: string[];
};

const findApplicationConfigPath = async (appPath: string): Promise<string> => {
  const srcConfigFile = path.join(appPath, 'src', 'application.config.ts');
  const rootConfigFile = path.join(appPath, 'application.config.ts');

  if (await fs.pathExists(srcConfigFile)) {
    return srcConfigFile;
  }

  if (await fs.pathExists(rootConfigFile)) {
    return rootConfigFile;
  }

  throw new Error(
    'Missing application.config.ts. Create it in your app root or in src/',
  );
};

export const hasSrcFolder = async (appPath: string): Promise<boolean> => {
  const srcFolder = path.join(appPath, 'src');

  return fs.pathExists(srcFolder);
};

const loadSources = async (appPath: string): Promise<Sources> => {
  const sources: Sources = {};

  const hasSrc = await hasSrcFolder(appPath);
  const patterns = hasSrc
    ? ['src/**/*.ts', 'src/**/*.tsx', 'generated/**/*.ts']
    : ['**/*.ts', '**/*.tsx', 'generated/**/*.ts'];

  const tsFiles = await glob(patterns, {
    cwd: appPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**', '**/.twenty/**'],
  });

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

const writeManifestToOutput = async (
  appPath: string,
  manifest: ApplicationManifest,
): Promise<void> => {
  try {
    const outputDir = path.join(appPath, OUTPUT_DIR);
    await fs.ensureDir(outputDir);

    const manifestPath = path.join(outputDir, 'manifest.json');
    await fs.writeJSON(manifestPath, manifest, { spaces: 2 });

    console.log(chalk.green(`  ✓ Manifest written to ${manifestPath}`));
  } catch (error) {
    console.error(
      chalk.red('  ✗ Failed to write manifest:'),
      error instanceof Error ? error.message : error,
    );
  }
};

export type RunManifestBuildOptions = {
  display?: boolean;
  writeOutput?: boolean;
};

const EMPTY_FILE_PATHS: EntityFilePaths = {
  application: [],
  objects: [],
  objectExtensions: [],
  functions: [],
  frontComponents: [],
  roles: [],
};

export type ManifestBuildResult = {
  manifest: ApplicationManifest | null;
  filePaths: EntityFilePaths;
};

export const runManifestBuild = async (
  appPath: string,
  options: RunManifestBuildOptions = {},
): Promise<ManifestBuildResult> => {
  const { display = true, writeOutput = true } = options;

  if (display) {
    console.log(chalk.blue('🔄 Building manifest...'));
  }

  try {
    await findApplicationConfigPath(appPath);
    manifestExtractFromFileServer.init(appPath);

    const packageJson = await parseJsoncFile(
      await findPathFile(appPath, 'package.json'),
    );

    const [
      applicationBuildResult,
      objectBuildResult,
      objectExtensionBuildResult,
      functionBuildResult,
      frontComponentBuildResult,
      roleBuildResult,
      sources,
    ] = await Promise.all([
      applicationEntityBuilder.build(appPath),
      objectEntityBuilder.build(appPath),
      objectExtensionEntityBuilder.build(appPath),
      functionEntityBuilder.build(appPath),
      frontComponentEntityBuilder.build(appPath),
      roleEntityBuilder.build(appPath),
      loadSources(appPath),
    ]);

    const application = applicationBuildResult.manifests[0];
    const objectManifests = objectBuildResult.manifests;
    const objectExtensionManifests = objectExtensionBuildResult.manifests;
    const functionManifests = functionBuildResult.manifests;
    const frontComponentManifests = frontComponentBuildResult.manifests;
    const roleManifests = roleBuildResult.manifests;

    const filePaths: EntityFilePaths = {
      application: applicationBuildResult.filePaths,
      objects: objectBuildResult.filePaths,
      objectExtensions: objectExtensionBuildResult.filePaths,
      functions: functionBuildResult.filePaths,
      frontComponents: frontComponentBuildResult.filePaths,
      roles: roleBuildResult.filePaths,
    };

    const manifest: ApplicationManifest = {
      application,
      objects: objectManifests,
      objectExtensions:
        objectExtensionManifests.length > 0 ? objectExtensionManifests : undefined,
      serverlessFunctions: functionManifests,
      frontComponents:
        frontComponentManifests.length > 0 ? frontComponentManifests : undefined,
      roles: roleManifests,
      sources,
      packageJson,
    };

    const validation = validateManifest({
      application,
      objects: objectManifests,
      objectExtensions: objectExtensionManifests,
      serverlessFunctions: functionManifests,
      frontComponents: frontComponentManifests,
      roles: roleManifests,
    });

    if (!validation.isValid) {
      throw new ManifestValidationError(validation.errors);
    }

    if (display) {
      displayEntitySummary(manifest);
      if (validation.warnings.length > 0) {
        displayWarnings(validation.warnings);
      }
    }

    if (writeOutput) {
      await writeManifestToOutput(appPath, manifest);
    }

    return { manifest, filePaths };
  } catch (error) {
    if (display) {
      if (error instanceof ManifestValidationError) {
        displayErrors(error);
      } else {
        console.error(
          chalk.red('  ✗ Build failed:'),
          error instanceof Error ? error.message : error,
        );
      }
    }
    return { manifest: null, filePaths: EMPTY_FILE_PATHS };
  }
};

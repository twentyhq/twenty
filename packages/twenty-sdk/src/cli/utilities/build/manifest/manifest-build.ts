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

const validateFolderStructure = async (appPath: string): Promise<void> => {
  const srcFolder = path.join(appPath, 'src');

  if (!(await fs.pathExists(srcFolder))) {
    throw new Error(
      `Missing src/ folder in ${appPath}.\n` + 'Create it with: mkdir -p src',
    );
  }

  const configFile = path.join(appPath, 'src', 'application.config.ts');
  if (!(await fs.pathExists(configFile))) {
    throw new Error('Missing src/application.config.ts');
  }
};

const loadSources = async (appPath: string): Promise<Sources> => {
  const sources: Sources = {};

  const tsFiles = await glob(['src/**/*.ts', 'src/**/*.tsx', 'generated/**/*.ts'], {
    cwd: appPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**'],
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

export const runManifestBuild = async (
  appPath: string,
  options: RunManifestBuildOptions = {},
): Promise<ApplicationManifest | null> => {
  const { display = true, writeOutput = true } = options;

  if (display) {
    console.log(chalk.blue('🔄 Building manifest...'));
  }

  try {
    await validateFolderStructure(appPath);
    manifestExtractFromFileServer.init(appPath);

    const packageJson = await parseJsoncFile(
      await findPathFile(appPath, 'package.json'),
    );

    const [
      application,
      objectManifests,
      objectExtensionManifests,
      functionManifests,
      frontComponentManifests,
      roleManifests,
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

    return manifest;
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
    return null;
  }
};

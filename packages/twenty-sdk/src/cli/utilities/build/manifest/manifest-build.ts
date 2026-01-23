import { findPathFile } from '@/cli/utilities/file/utils/file-find';
import { parseJsoncFile } from '@/cli/utilities/file/utils/file-jsonc';
import { glob } from 'fast-glob';
import * as fs from 'fs-extra';
import { relative, sep } from 'path';
import { type ApplicationManifest } from 'twenty-shared/application';
import { type Sources } from 'twenty-shared/types';
import { createLogger } from '../common/logger';
import { applicationEntityBuilder } from './entities/application';
import { frontComponentEntityBuilder } from './entities/front-component';
import { functionEntityBuilder } from './entities/function';
import { objectEntityBuilder } from './entities/object';
import { objectExtensionEntityBuilder } from './entities/object-extension';
import { roleEntityBuilder } from './entities/role';
import { displayEntitySummary, displayErrors, displayWarnings } from './manifest-display';
import { manifestExtractFromFileServer } from './manifest-extract-from-file-server';
import { validateManifest } from './manifest-validate';
import { writeManifestToOutput } from './manifest-writer';
import { ManifestValidationError } from './manifest.types';

const logger = createLogger('manifest-watch');

export type EntityFilePaths = {
  application: string[];
  objects: string[];
  objectExtensions: string[];
  functions: string[];
  frontComponents: string[];
  roles: string[];
};

const loadSources = async (appPath: string): Promise<Sources> => {
  const sources: Sources = {};

  const tsFiles = await glob(['**/*.ts', '**/*.tsx'], {
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

export type ManifestEntityType = 'function' | 'frontComponent';

export type UpdateManifestChecksumParams = {
  manifest: ApplicationManifest;
  entityType: ManifestEntityType;
  builtPath: string;
  checksum: string;
};

export const updateManifestChecksum = ({
  manifest,
  entityType,
  builtPath,
  checksum,
}: UpdateManifestChecksumParams): ApplicationManifest | null => {
  if (entityType === 'function') {
    const fnIndex = manifest.functions.findIndex((f) => f.builtHandlerPath === builtPath);
    if (fnIndex === -1) {
      return null;
    }
    return {
      ...manifest,
      functions: manifest.functions.map((fn, index) =>
        index === fnIndex ? { ...fn, builtHandlerChecksum: checksum } : fn,
      ),
    };
  }

  const componentIndex = manifest.frontComponents?.findIndex(
    (c) => c.builtComponentPath === builtPath,
  ) ?? -1;
  if (componentIndex === -1) {
    return null;
  }
  return {
    ...manifest,
    frontComponents: manifest.frontComponents?.map((component, index) =>
      index === componentIndex ? { ...component, builtComponentChecksum: checksum } : component,
    ),
  };
};

export const runManifestBuild = async (
  appPath: string,
  options: RunManifestBuildOptions = {},
): Promise<ManifestBuildResult> => {
  const { display = true, writeOutput = true } = options;

  if (display) {
    logger.log('🔄 Building...');
  }

  try {
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
      functions: functionManifests,
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
      functions: functionManifests,
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
      const manifestPath = await writeManifestToOutput(appPath, manifest);
      logger.success(`✓ Written to ${manifestPath}`);
    }

    return { manifest, filePaths };
  } catch (error) {
    if (display) {
      if (error instanceof ManifestValidationError) {
        displayErrors(error);
      } else {
        logger.error(
          `✗ Build failed: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
    return { manifest: null, filePaths: EMPTY_FILE_PATHS };
  }
};

import { findPathFile } from '@/cli/utilities/file/file-find';
import { parseJsoncFile } from '@/cli/utilities/file/file-jsonc';
import { glob } from 'fast-glob';
import * as fs from 'fs-extra';
import { relative, sep } from 'path';
import {
  type ApplicationManifest,
  type ObjectManifest,
  type ServerlessFunctionManifest,
  type FrontComponentManifest,
  type ObjectExtensionManifest,
  type RoleManifest,
} from 'twenty-shared/application';
import { type Sources } from 'twenty-shared/types';
import { applicationEntityBuilder } from '@/cli/utilities/build/manifest/entities/application';
import { frontComponentEntityBuilder } from '@/cli/utilities/build/manifest/entities/front-component';
import { functionEntityBuilder } from '@/cli/utilities/build/manifest/entities/function';
import { objectEntityBuilder } from '@/cli/utilities/build/manifest/entities/object';
import { objectExtensionEntityBuilder } from '@/cli/utilities/build/manifest/entities/object-extension';
import { roleEntityBuilder } from '@/cli/utilities/build/manifest/entities/role';
import {
  displayEntitySummary,
  displayErrors,
  displayWarnings,
} from '@/cli/utilities/build/manifest/manifest-display';
import { manifestExtractFromFileServer } from './manifest-extract-from-file-server';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { ManifestValidationError } from '@/cli/utilities/build/manifest/manifest-types';
import { createLogger } from '@/cli/utilities/build/common/logger';
import { validateManifest } from '@/cli/utilities/build/manifest/manifest-validate';
import { readFile } from 'fs-extra';

const logger = createLogger('manifest-watch');

/**
 * Entity type with source path attached.
 */
export type WithSourcePath<T> = T & { sourcePath: string };

/**
 * All manifest entities with their source paths attached.
 */
export type ManifestEntities = {
  objects: WithSourcePath<ObjectManifest>[];
  objectExtensions: WithSourcePath<ObjectExtensionManifest>[];
  functions: WithSourcePath<ServerlessFunctionManifest>[];
  frontComponents: WithSourcePath<FrontComponentManifest>[];
  roles: WithSourcePath<RoleManifest>[];
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

export const EMPTY_ENTITIES: ManifestEntities = {
  objects: [],
  objectExtensions: [],
  functions: [],
  frontComponents: [],
  roles: [],
};

export type ManifestBuildResult = {
  manifest: ApplicationManifest | null;
  /**
   * All manifest entities with their source paths attached.
   * Each entity has a `sourcePath` property containing the path to its source file.
   */
  entities: ManifestEntities;
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
    const fnIndex = manifest.functions.findIndex(
      (f) => f.builtHandlerPath === builtPath,
    );
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

  const componentIndex =
    manifest.frontComponents.findIndex(
      (c) => c.builtComponentPath === builtPath,
    ) ?? -1;
  if (componentIndex === -1) {
    return null;
  }
  return {
    ...manifest,
    frontComponents: manifest.frontComponents.map((component, index) =>
      index === componentIndex
        ? { ...component, builtComponentChecksum: checksum }
        : component,
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

    const yarnLock = await readFile(
      await findPathFile(appPath, 'yarn.lock'),
      'utf8',
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

    // Build entities with source paths attached
    const entities: ManifestEntities = {
      objects: objectBuildResult.manifests.map((obj, i) => ({
        ...obj,
        sourcePath: objectBuildResult.filePaths[i],
      })),
      objectExtensions: objectExtensionBuildResult.manifests.map((ext, i) => ({
        ...ext,
        sourcePath: objectExtensionBuildResult.filePaths[i],
      })),
      functions: functionBuildResult.manifests.map((fn, i) => ({
        ...fn,
        sourcePath: functionBuildResult.filePaths[i],
      })),
      frontComponents: frontComponentBuildResult.manifests.map((fc, i) => ({
        ...fc,
        sourcePath: frontComponentBuildResult.filePaths[i],
      })),
      roles: roleBuildResult.manifests.map((role, i) => ({
        ...role,
        sourcePath: roleBuildResult.filePaths[i],
      })),
    };

    const manifest: ApplicationManifest = {
      application,
      objects: entities.objects,
      objectExtensions: entities.objectExtensions,
      functions: entities.functions,
      frontComponents: entities.frontComponents,
      roles: entities.roles,
      sources,
      packageJson,
      yarnLock,
    };

    const validation = validateManifest({
      application,
      objects: entities.objects,
      objectExtensions: entities.objectExtensions,
      functions: entities.functions,
      frontComponents: entities.frontComponents,
      roles: entities.roles,
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

    return { manifest, entities };
  } catch (error) {
    if (error instanceof ManifestValidationError) {
      displayErrors(error);
    } else {
      logger.error(
        `✗ Build failed: ${error instanceof Error ? error.message : error}`,
      );
    }
    return { manifest: null, entities: EMPTY_ENTITIES };
  }
};

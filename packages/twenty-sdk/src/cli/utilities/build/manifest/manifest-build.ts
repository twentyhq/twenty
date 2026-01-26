import { findPathFile } from '@/cli/utilities/file/file-find';
import { parseJsoncFile } from '@/cli/utilities/file/file-jsonc';
import { glob } from 'fast-glob';
import * as fs from 'fs-extra';
import { readFile } from 'fs-extra';
import { relative, sep } from 'path';
import { type ApplicationManifest } from 'twenty-shared/application';
import { FileFolder, type Sources } from 'twenty-shared/types';
import { applicationEntityBuilder } from '@/cli/utilities/build/manifest/entities/application';
import { frontComponentEntityBuilder } from '@/cli/utilities/build/manifest/entities/front-component';
import { functionEntityBuilder } from '@/cli/utilities/build/manifest/entities/function';
import { objectEntityBuilder } from '@/cli/utilities/build/manifest/entities/object';
import { objectExtensionEntityBuilder } from '@/cli/utilities/build/manifest/entities/object-extension';
import { roleEntityBuilder } from '@/cli/utilities/build/manifest/entities/role';

import { manifestExtractFromFileServer } from './manifest-extract-from-file-server';
import { OUTPUT_DIR } from '@/cli/utilities/build/common/constants';

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

export const EMPTY_FILE_PATHS: EntityFilePaths = {
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
  error?: string;
};

export type UpdateManifestChecksumParams = {
  manifest: ApplicationManifest;
  builtFileInfos: Map<
    string,
    { checksum: string; builtPath: string; fileFolder: FileFolder }
  >;
};

export const updateManifestChecksum = ({
  manifest,
  builtFileInfos,
}: UpdateManifestChecksumParams): ApplicationManifest => {
  let result = structuredClone(manifest);
  for (const [
    builtPath,
    { fileFolder, checksum },
  ] of builtFileInfos.entries()) {
    const rootBuiltPath = relative(OUTPUT_DIR, builtPath);
    if (fileFolder === FileFolder.BuiltFunction) {
      const fnIndex = result.functions.findIndex(
        (f) => f.builtHandlerPath === rootBuiltPath,
      );
      if (fnIndex === -1) {
        continue;
      }
      result = {
        ...result,
        functions: result.functions.map((fn, index) =>
          index === fnIndex ? { ...fn, builtHandlerChecksum: checksum } : fn,
        ),
      };
    }

    const componentIndex =
      result.frontComponents.findIndex(
        (c) => c.builtComponentPath === rootBuiltPath,
      ) ?? -1;
    if (componentIndex === -1) {
      continue;
    }
    result = {
      ...result,
      frontComponents: result.frontComponents.map((component, index) =>
        index === componentIndex
          ? { ...component, builtComponentChecksum: checksum }
          : component,
      ),
    };
  }
  return result;
};

export const runManifestBuild = async (
  appPath: string,
): Promise<ManifestBuildResult> => {
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
      objectExtensions: objectExtensionManifests,
      functions: functionManifests,
      frontComponents: frontComponentManifests,
      roles: roleManifests,
      sources,
      packageJson,
      yarnLock,
    };

    return { manifest, filePaths };
  } catch (error) {
    return {
      manifest: null,
      filePaths: EMPTY_FILE_PATHS,
      error: error instanceof Error ? error.message : `${error}`,
    };
  }
};

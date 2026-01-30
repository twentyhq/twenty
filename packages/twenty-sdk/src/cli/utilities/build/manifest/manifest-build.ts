import { findPathFile } from '@/cli/utilities/file/file-find';
import { parseJsoncFile } from '@/cli/utilities/file/file-jsonc';
import { glob } from 'fast-glob';
import * as fs from 'fs-extra';
import { readFile } from 'fs-extra';
import { relative, sep } from 'path';
import {
  type ApplicationManifest,
  OUTPUT_DIR,
} from 'twenty-shared/application';
import { FileFolder, type Sources } from 'twenty-shared/types';
import { applicationEntityBuilder } from '@/cli/utilities/build/manifest/entities/application';
import { assetEntityBuilder } from '@/cli/utilities/build/manifest/entities/asset';
import { frontComponentEntityBuilder } from '@/cli/utilities/build/manifest/entities/front-component';
import { logicFunctionEntityBuilder } from '@/cli/utilities/build/manifest/entities/logic-function';
import { objectEntityBuilder } from '@/cli/utilities/build/manifest/entities/object';
import { fieldEntityBuilder } from '@/cli/utilities/build/manifest/entities/field';
import { roleEntityBuilder } from '@/cli/utilities/build/manifest/entities/role';

import { manifestExtractFromFileServer } from './manifest-extract-from-file-server';
import type { EntityFilePaths } from '@/cli/utilities/build/manifest/manifest-extract-config';

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
  fields: [],
  logicFunctions: [],
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
    if (fileFolder === FileFolder.BuiltLogicFunction) {
      const logicFunctions = result.logicFunctions;
      const fnIndex = logicFunctions.findIndex(
        (f) => f.builtHandlerPath === rootBuiltPath,
      );
      if (fnIndex === -1) {
        continue;
      }
      result = {
        ...result,
        logicFunctions: logicFunctions.map((fn, index) =>
          index === fnIndex ? { ...fn, builtHandlerChecksum: checksum } : fn,
        ),
      };
    }

    if (fileFolder === FileFolder.PublicAsset) {
      const assets = result.publicAssets;
      const assetIndex = assets.findIndex((a) => a.filePath === rootBuiltPath);
      if (assetIndex === -1) {
        continue;
      }
      result = {
        ...result,
        publicAssets: assets.map((asset, index) =>
          index === assetIndex ? { ...asset, checksum } : asset,
        ),
      };
      continue;
    }

    if (fileFolder === FileFolder.BuiltFrontComponent) {
      const frontComponents = result.frontComponents;
      const componentIndex =
        frontComponents.findIndex(
          (c) => c.builtComponentPath === rootBuiltPath,
        ) ?? -1;
      if (componentIndex === -1) {
        continue;
      }
      result = {
        ...result,
        frontComponents: frontComponents.map((component, index) =>
          index === componentIndex
            ? { ...component, builtComponentChecksum: checksum }
            : component,
        ),
      };
    }
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
      assetBuildResult,
      sources,
    ] = await Promise.all([
      applicationEntityBuilder.build(appPath),
      objectEntityBuilder.build(appPath),
      fieldEntityBuilder.build(appPath),
      logicFunctionEntityBuilder.build(appPath),
      frontComponentEntityBuilder.build(appPath),
      roleEntityBuilder.build(appPath),
      assetEntityBuilder.build(appPath),
      loadSources(appPath),
    ]);

    const application = applicationBuildResult.manifests[0];
    const objectManifests = objectBuildResult.manifests;
    const objectExtensionManifests = objectExtensionBuildResult.manifests;
    const functionManifests = functionBuildResult.manifests;
    const frontComponentManifests = frontComponentBuildResult.manifests;
    const roleManifests = roleBuildResult.manifests;
    const assetManifests = assetBuildResult.manifests;

    const filePaths: EntityFilePaths = {
      application: applicationBuildResult.filePaths,
      objects: objectBuildResult.filePaths,
      fields: objectExtensionBuildResult.filePaths,
      logicFunctions: functionBuildResult.filePaths,
      frontComponents: frontComponentBuildResult.filePaths,
      roles: roleBuildResult.filePaths,
    };

    const manifest: ApplicationManifest = {
      application,
      objects: objectManifests,
      fields: objectExtensionManifests,
      logicFunctions: functionManifests,
      frontComponents: frontComponentManifests,
      roles: roleManifests,
      publicAssets: assetManifests,
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

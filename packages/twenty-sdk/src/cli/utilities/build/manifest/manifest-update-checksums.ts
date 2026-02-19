import crypto from 'crypto';
import { relative } from 'path';
import { type Manifest, OUTPUT_DIR } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

import type { EntityFilePaths } from '@/cli/utilities/build/manifest/manifest-extract-config';

export type ManifestBuildResult = {
  manifest: Manifest | null;
  filePaths: EntityFilePaths;
  error?: string;
};

export type UpdateManifestChecksumParams = {
  manifest: Manifest;
  builtFileInfos: Map<
    string,
    { checksum: string; builtPath: string; fileFolder: FileFolder }
  >;
};

export const manifestUpdateChecksums = ({
  manifest,
  builtFileInfos,
}: UpdateManifestChecksumParams): Manifest => {
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

    if (fileFolder === FileFolder.Dependencies) {
      if (rootBuiltPath === 'package.json') {
        result.application.packageJsonChecksum = checksum;
      }

      if (rootBuiltPath === 'yarn.lock') {
        result.application.yarnLockChecksum = checksum;
      }
    }
  }

  const apiClientChecksums: string[] = [];

  for (const [builtPath, { fileFolder }] of builtFileInfos.entries()) {
    const rootBuiltPath = relative(OUTPUT_DIR, builtPath);

    if (
      fileFolder === FileFolder.Dependencies &&
      rootBuiltPath.startsWith('api-client/')
    ) {
      const entry = builtFileInfos.get(builtPath);

      if (entry) {
        apiClientChecksums.push(entry.checksum);
      }
    }
  }

  if (apiClientChecksums.length > 0) {
    result.application.apiClientChecksum = crypto
      .createHash('md5')
      .update(apiClientChecksums.sort().join(''))
      .digest('hex');
  }

  return result;
};

import { getWatchInputPlugins } from '@/app/dev/collect-watch-inputs';
import { getBaseFrontComponentBuildOptions } from '@/app/bundles/front-component-build/utils/get-base-front-component-build-options';
import { type OnFileBuiltCallback } from '@/app/bundles/types/on-file-built-callback.type';
import { type SharedDependenciesBuildContext } from '@/app/bundles/front-component-build/shared-dependencies-build/types/shared-dependencies-build-context.type';
import { enumerateSharedDependenciesExportNames } from '@/app/bundles/front-component-build/shared-dependencies-build/utils/enumerate-shared-dependencies-export-names';
import { getSharedDependenciesEntrySource } from '@/app/bundles/front-component-build/shared-dependencies-build/utils/get-shared-dependencies-entry-source';
import { getSharedDependenciesNamespaceCollisions } from '@/app/bundles/front-component-build/shared-dependencies-build/utils/get-shared-dependencies-namespace-collisions';
import { ensureDir } from '@/app/fs-utils';
import crypto from 'crypto';
import * as esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'path';
import {
  OUTPUT_DIR,
  type FrontComponentSharedDependenciesManifest,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isNonEmptyArray } from '@sniptt/guards';

export const buildSharedDependenciesBundle = async ({
  appPath,
  sharedDependencies,
  outputDir = OUTPUT_DIR,
  onFileBuilt,
}: {
  appPath: string;
  outputDir?: string;
  sharedDependencies: FrontComponentSharedDependenciesManifest;
  onFileBuilt: OnFileBuiltCallback;
}): Promise<SharedDependenciesBuildContext> => {
  const namespaceCollisions = getSharedDependenciesNamespaceCollisions(
    sharedDependencies.dependencies,
  );

  if (isNonEmptyArray(namespaceCollisions)) {
    throw new Error(
      `Shared dependencies map to the same bundle namespace: ${namespaceCollisions
        .map((specifiers) => specifiers.join(' and '))
        .join(', ')}`,
    );
  }

  const exportNamesBySpecifier = new Map(
    await Promise.all(
      sharedDependencies.dependencies.map(
        async (specifier) =>
          [
            specifier,
            await enumerateSharedDependenciesExportNames({
              appPath,
              specifier,
            }),
          ] as const,
      ),
    ),
  );

  const builtPath = join(outputDir, sharedDependencies.builtPath);
  const absoluteBuiltPath = join(appPath, builtPath);

  await ensureDir(dirname(absoluteBuiltPath));

  await esbuild.build({
    ...getBaseFrontComponentBuildOptions(),
    plugins: [
      ...getWatchInputPlugins(),
      ...(getBaseFrontComponentBuildOptions().plugins ?? []),
    ],
    stdin: {
      contents: getSharedDependenciesEntrySource(exportNamesBySpecifier),
      resolveDir: appPath,
      sourcefile: 'twenty-shared-dependencies-entry.js',
      loader: 'js',
    },
    outfile: absoluteBuiltPath,
    outExtension: undefined,
    external: [],
  });

  const content = await readFile(absoluteBuiltPath);
  const checksum = crypto.createHash('sha256').update(content).digest('hex');

  await onFileBuilt({
    fileFolder: FileFolder.BuiltFrontComponent,
    builtPath,
    sourcePath: 'package.json',
    checksum,
  });

  return { exportNamesBySpecifier };
};

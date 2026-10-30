import { type PackageJson } from 'type-fest';
import { getWatchInputPlugins } from '@/app/dev/collect-watch-inputs';
import { getBaseFrontComponentBuildOptions } from '@/app/bundles/front-component-build/utils/get-base-front-component-build-options';
import { type OnFileBuiltCallback } from '@/app/bundles/types/on-file-built-callback.type';
import {
  getSharedDependenciesEntrySource,
  normalizeFrontComponentSharedDependencies,
  getSharedDependenciesBuildManifestPath,
  type SharedDependenciesBuildContext,
  type SharedDependenciesBuildManifest,
} from 'twenty-shared/front-component-build';
import { enumerateSharedDependenciesExportNames } from '@/app/bundles/front-component-build/shared-dependencies-build/utils/enumerate-shared-dependencies-export-names';
import { getSharedDependenciesNamespaceCollisions } from '@/app/bundles/front-component-build/shared-dependencies-build/utils/get-shared-dependencies-namespace-collisions';
import { ensureDir, pathExists, readJson } from '@/app/fs-utils';
import crypto from 'crypto';
import * as esbuild from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'path';
import {
  OUTPUT_DIR,
  computePackageJsonChecksum,
  computeDependencyFileChecksum,
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
  const packageJson = await readJson<PackageJson>(
    join(appPath, 'package.json'),
  );
  const dependencies = normalizeFrontComponentSharedDependencies(
    sharedDependencies.dependencies,
    Object.keys({
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    }),
  );
  const namespaceCollisions =
    getSharedDependenciesNamespaceCollisions(dependencies);

  if (isNonEmptyArray(namespaceCollisions)) {
    throw new Error(
      `Shared dependencies map to the same bundle namespace: ${namespaceCollisions
        .map((specifiers) => specifiers.join(' and '))
        .join(', ')}`,
    );
  }

  const exportNamesBySpecifier = new Map(
    await Promise.all(
      dependencies.map(
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

  const yarnLockPath = join(appPath, 'yarn.lock');
  const buildManifest: SharedDependenciesBuildManifest = {
    checksum,
    packageJsonChecksum: computePackageJsonChecksum(
      await readFile(join(appPath, 'package.json'), 'utf-8'),
    ),
    yarnLockChecksum: (await pathExists(yarnLockPath))
      ? computeDependencyFileChecksum(await readFile(yarnLockPath, 'utf-8'))
      : null,
    exports: Object.fromEntries(exportNamesBySpecifier),
  };
  const manifestSource = JSON.stringify(buildManifest);

  await writeFile(
    getSharedDependenciesBuildManifestPath(absoluteBuiltPath),
    manifestSource,
  );
  await onFileBuilt({
    fileFolder: FileFolder.Dependencies,
    builtPath: getSharedDependenciesBuildManifestPath(builtPath),
    sourcePath: 'package.json',
    checksum: crypto.createHash('sha256').update(manifestSource).digest('hex'),
  });

  return { exportNamesBySpecifier };
};

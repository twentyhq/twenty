import { getBaseFrontComponentBuildOptions } from '@/cli/utilities/build/common/front-component-build/utils/get-base-front-component-build-options';
import { type OnFileBuiltCallback } from '@/cli/utilities/build/common/restartable-watcher-interface';
import { type SharedDependenciesBuildContext } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/types/shared-dependencies-build-context.type';
import { enumerateSharedDependenciesExportNames } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/utils/enumerate-shared-dependencies-export-names';
import { getSharedDependenciesEntrySource } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/utils/get-shared-dependencies-entry-source';
import { getSharedDependenciesNamespaceCollisions } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/utils/get-shared-dependencies-namespace-collisions';
import { ensureDir } from '@/cli/utilities/file/fs-utils';
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
  onFileBuilt,
}: {
  appPath: string;
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

  const builtPath = join(OUTPUT_DIR, sharedDependencies.builtPath);
  const absoluteBuiltPath = join(appPath, builtPath);

  await ensureDir(dirname(absoluteBuiltPath));

  await esbuild.build({
    ...getBaseFrontComponentBuildOptions(),
    stdin: {
      contents: getSharedDependenciesEntrySource(
        sharedDependencies.dependencies,
      ),
      resolveDir: appPath,
      sourcefile: 'twenty-shared-dependencies-entry.js',
      loader: 'js',
    },
    outfile: absoluteBuiltPath,
    outExtension: undefined,
    external: [],
  });

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

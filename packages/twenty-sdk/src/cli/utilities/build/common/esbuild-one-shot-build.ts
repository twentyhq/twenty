import { processEsbuildResult } from '@/cli/utilities/build/common/esbuild-result-processor';
import { type OnFileBuiltCallback } from '@/cli/utilities/build/common/restartable-watcher-interface';
import * as esbuild from 'esbuild';
import path from 'path';
import { type FileFolder } from 'twenty-shared/types';

export type EsbuildOneShotBuildOptions = {
  appPath: string;
  sourcePaths: string[];
  fileFolder: FileFolder;
  buildOptions: esbuild.BuildOptions;
  onFileBuilt: OnFileBuiltCallback;
};

export const esbuildOneShotBuild = async ({
  appPath,
  sourcePaths,
  fileFolder,
  buildOptions,
  onFileBuilt,
}: EsbuildOneShotBuildOptions): Promise<void> => {
  if (sourcePaths.length === 0) {
    return;
  }

  const entryPoints: Record<string, string> = {};

  for (const sourcePath of sourcePaths) {
    const entryName = sourcePath.replace(/\.tsx?$/, '');
    entryPoints[entryName] = path.join(appPath, sourcePath);
  }

  const result = await esbuild.build({
    ...buildOptions,
    entryPoints,
  });

  await processEsbuildResult({
    result,
    appPath,
    fileFolder,
    lastChecksums: new Map(),
    onFileBuilt,
  });
};

import crypto from 'crypto';
import type * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import path from 'path';
import { type OnFileBuiltCallback } from '@/cli/utilities/build/common/restartable-watcher-interface';
import { type FileFolder } from 'twenty-shared/types';

export type ProcessEsbuildResultParams = {
  result: esbuild.BuildResult;
  appPath: string;
  fileFolder: FileFolder;
  lastChecksums: Map<string, string>;
  onFileBuilt?: OnFileBuiltCallback;
};

export const processEsbuildResult = async ({
  result,
  appPath,
  fileFolder,
  lastChecksums,
  onFileBuilt,
}: ProcessEsbuildResultParams) => {
  const outputFiles = Object.keys(result.metafile?.outputs ?? {}).filter(
    (file) => file.endsWith('.mjs'),
  );

  for (const outputFile of outputFiles) {
    const absoluteBuiltFile = path.resolve(outputFile);
    const relativeBuiltPath = path.relative(appPath, absoluteBuiltFile);
    const absoluteSourcePath =
      result.metafile?.outputs?.[outputFile]?.entryPoint || '';
    const relativeSourcePath = path.relative(appPath, absoluteSourcePath);

    const content = await fs.readFile(absoluteBuiltFile);
    const checksum = crypto.createHash('md5').update(content).digest('hex');

    const lastChecksum = lastChecksums.get(relativeBuiltPath);

    if (lastChecksum === checksum) {
      continue;
    }

    lastChecksums.set(relativeBuiltPath, checksum);

    if (onFileBuilt) {
      await onFileBuilt({
        fileFolder,
        builtPath: relativeBuiltPath,
        filePath: relativeSourcePath,
        checksum,
      });
    }
  }
};

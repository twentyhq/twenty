import crypto from 'crypto';
import type * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import path from 'path';
import {
  type OnFileBuiltCallback,
  type OnFileBuiltWithAssetPathsCallback,
} from './restartable-watcher.interface';

export type ProcessEsbuildResultParams = {
  result: esbuild.BuildResult;
  outputDir: string;
  builtDir: string;
  lastChecksums: Map<string, string>;
  onFileBuilt?: OnFileBuiltCallback;
  onSuccess: (relativePath: string) => void;
};

export type ProcessEsbuildResultWithAssetPathsParams = {
  result: esbuild.BuildResult;
  outputDir: string;
  builtDir: string;
  lastChecksums: Map<string, string>;
  assetPathsMap: Map<string, string[]>;
  onFileBuilt?: OnFileBuiltWithAssetPathsCallback;
  onSuccess: (relativePath: string, assetPaths: string[]) => void;
};

export type ProcessEsbuildResultOutput = {
  hasChanges: boolean;
};

export const processEsbuildResult = async ({
  result,
  outputDir,
  builtDir,
  lastChecksums,
  onFileBuilt,
  onSuccess,
}: ProcessEsbuildResultParams): Promise<ProcessEsbuildResultOutput> => {
  const outputFiles = Object.keys(result.metafile?.outputs ?? {})
    .filter((file) => file.endsWith('.mjs'));

  let hasChanges = false;

  for (const outputFile of outputFiles) {
    const absoluteOutputFile = path.resolve(outputFile);
    const relativePath = path.relative(outputDir, absoluteOutputFile);
    const builtPath = `${builtDir}/${relativePath}`;

    const content = await fs.readFile(absoluteOutputFile);
    const checksum = crypto.createHash('md5').update(content).digest('hex');

    const lastChecksum = lastChecksums.get(builtPath);
    if (lastChecksum === checksum) {
      continue;
    }

    hasChanges = true;
    lastChecksums.set(builtPath, checksum);
    onSuccess(relativePath);

    if (onFileBuilt) {
      onFileBuilt(builtPath, checksum);
    }
  }

  return { hasChanges };
};

export const processEsbuildResultWithAssetPaths = async ({
  result,
  outputDir,
  builtDir,
  lastChecksums,
  assetPathsMap,
  onFileBuilt,
  onSuccess,
}: ProcessEsbuildResultWithAssetPathsParams): Promise<ProcessEsbuildResultOutput> => {
  const outputFiles = Object.keys(result.metafile?.outputs ?? {})
    .filter((file) => file.endsWith('.mjs'));

  let hasChanges = false;

  for (const outputFile of outputFiles) {
    const absoluteOutputFile = path.resolve(outputFile);
    const relativePath = path.relative(outputDir, absoluteOutputFile);
    const builtPath = `${builtDir}/${relativePath}`;

    const content = await fs.readFile(absoluteOutputFile);
    const checksum = crypto.createHash('md5').update(content).digest('hex');

    const lastChecksum = lastChecksums.get(builtPath);
    if (lastChecksum === checksum) {
      continue;
    }

    hasChanges = true;
    lastChecksums.set(builtPath, checksum);

    const assetPaths = assetPathsMap.get(builtPath) ?? [];
    onSuccess(relativePath, assetPaths);

    if (onFileBuilt) {
      onFileBuilt(builtPath, checksum, assetPaths);
    }
  }

  return { hasChanges };
};

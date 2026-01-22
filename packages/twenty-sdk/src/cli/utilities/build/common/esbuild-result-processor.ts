import crypto from 'crypto';
import type * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import path from 'path';
import {
  type BuiltAsset,
  type OnFileBuiltCallback,
  type OnFileBuiltWithAssetsCallback,
} from './restartable-watcher.interface';

export type ProcessEsbuildResultParams = {
  result: esbuild.BuildResult;
  outputDir: string;
  builtDir: string;
  lastChecksums: Map<string, string>;
  onFileBuilt?: OnFileBuiltCallback;
  onSuccess: (relativePath: string) => void;
};

export type ProcessEsbuildResultWithAssetsParams = {
  result: esbuild.BuildResult;
  outputDir: string;
  builtDir: string;
  lastChecksums: Map<string, string>;
  assetsMap: Map<string, BuiltAsset[]>;
  onFileBuilt?: OnFileBuiltWithAssetsCallback;
  onSuccess: (relativePath: string, assets: BuiltAsset[]) => void;
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

export const processEsbuildResultWithAssets = async ({
  result,
  outputDir,
  builtDir,
  lastChecksums,
  assetsMap,
  onFileBuilt,
  onSuccess,
}: ProcessEsbuildResultWithAssetsParams): Promise<ProcessEsbuildResultOutput> => {
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

    const assets = assetsMap.get(builtPath) ?? [];
    onSuccess(relativePath, assets);

    if (onFileBuilt) {
      onFileBuilt(builtPath, checksum, assets);
    }
  }

  return { hasChanges };
};

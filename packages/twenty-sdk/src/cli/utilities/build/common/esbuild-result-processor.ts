import crypto from 'crypto';
import type * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import path from 'path';
import { OUTPUT_DIR } from './constants';
import {
  type OnFileBuiltCallback,
  type UploadConfig,
} from './restartable-watcher.interface';

export type ProcessEsbuildResultParams = {
  result: esbuild.BuildResult;
  outputDir: string;
  builtDir: string;
  lastChecksums: Map<string, string>;
  uploadConfig?: UploadConfig;
  onFileBuilt?: OnFileBuiltCallback;
  onSuccess: (relativePath: string) => void;
};

export type ProcessEsbuildResultOutput = {
  hasChanges: boolean;
};

export const processEsbuildResult = async ({
  result,
  outputDir,
  builtDir,
  lastChecksums,
  uploadConfig,
  onFileBuilt,
  onSuccess,
}: ProcessEsbuildResultParams): Promise<ProcessEsbuildResultOutput> => {
  const outputFiles = Object.keys(result.metafile?.outputs ?? {}).filter(
    (file) => file.endsWith('.mjs'),
  );

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
      await onFileBuilt(builtPath, checksum);
    }

    if (uploadConfig) {
      const uploadResult = await uploadConfig.apiService.uploadFile({
        filePath: path.join(uploadConfig.appPath, OUTPUT_DIR, builtPath),
        builtHandlerPath: builtPath,
        fileFolder: uploadConfig.fileFolder,
        applicationUniversalIdentifier:
          uploadConfig.applicationUniversalIdentifier,
      });

      if (uploadResult.success) {
        uploadConfig.onUploadSuccess?.(builtPath);
      } else {
        uploadConfig.onUploadError?.(builtPath, uploadResult.error);
      }

      await uploadConfig.onFileUploaded?.(builtPath, uploadResult.success);
    }
  }

  return { hasChanges };
};

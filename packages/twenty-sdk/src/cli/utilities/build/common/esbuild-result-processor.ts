import crypto from 'crypto';
import type * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import path from 'path';
import { type OnFileBuiltCallback } from './restartable-watcher.interface';

export type ProcessEsbuildResultParams = {
  result: esbuild.BuildResult;
  outputDir: string;
  builtDir: string;
  lastInputsSignature: string | null;
  onFileBuilt?: OnFileBuiltCallback;
  onSuccess: (relativePath: string) => void;
};

export type ProcessEsbuildResultOutput = {
  newInputsSignature: string | null;
  skipped: boolean;
};

export const processEsbuildResult = async ({
  result,
  outputDir,
  builtDir,
  lastInputsSignature,
  onFileBuilt,
  onSuccess,
}: ProcessEsbuildResultParams): Promise<ProcessEsbuildResultOutput> => {
  const inputs = Object.keys(result.metafile?.inputs ?? {}).sort();
  const inputsSignature = inputs.join(',');

  if (lastInputsSignature === inputsSignature) {
    return { newInputsSignature: inputsSignature, skipped: true };
  }

  const outputFiles = Object.keys(result.metafile?.outputs ?? {})
    .filter((file) => file.endsWith('.mjs'));

  for (const outputFile of outputFiles) {
    const absoluteOutputFile = path.resolve(outputFile);
    const relativePath = path.relative(outputDir, absoluteOutputFile);
    const builtPath = `${builtDir}/${relativePath}`;
    onSuccess(relativePath);

    if (onFileBuilt) {
      const content = await fs.readFile(absoluteOutputFile);
      const checksum = crypto.createHash('md5').update(content).digest('hex');
      onFileBuilt(builtPath, checksum);
    }
  }

  return { newInputsSignature: inputsSignature, skipped: false };
};

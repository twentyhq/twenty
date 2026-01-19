import { FUNCTIONS_DIR } from '@/cli/constants/functions-dir';
import { OUTPUT_DIR } from '@/cli/constants/output-dir';
import * as fs from 'fs-extra';
import path from 'path';

/**
 * Computes the output path for a function, preserving directory structure.
 *
 * Examples:
 * - src/app/hello.function.ts → { relativePath: 'hello.function.js', outputDir: '' }
 * - src/app/utils/greet.function.ts → { relativePath: 'utils/greet.function.js', outputDir: 'utils' }
 */
export const computeFunctionOutputPath = (
  handlerPath: string,
): { relativePath: string; outputDir: string } => {
  const normalizedPath = handlerPath.replace(/\\/g, '/');

  let relativePath = normalizedPath;
  if (relativePath.startsWith('src/app/')) {
    relativePath = relativePath.slice('src/app/'.length);
  } else if (relativePath.startsWith('src/')) {
    relativePath = relativePath.slice('src/'.length);
  }

  relativePath = relativePath.replace(/\.ts$/, '.js');

  const outputDir = path.dirname(relativePath);
  const normalizedOutputDir = outputDir === '.' ? '' : outputDir;

  return {
    relativePath,
    outputDir: normalizedOutputDir,
  };
};

/**
 * Builds rollup input from function handler paths.
 */
export const buildFunctionInput = (
  appPath: string,
  handlerPaths: Array<{ handlerPath: string }>,
): Record<string, string> => {
  const input: Record<string, string> = {};

  for (const fn of handlerPaths) {
    const { relativePath } = computeFunctionOutputPath(fn.handlerPath);
    const chunkName = relativePath.replace(/\.js$/, '');
    input[chunkName] = path.join(appPath, fn.handlerPath);
  }

  return input;
};

/**
 * Cleans up old function output files that are no longer in the current entry points.
 */
export const cleanupOldFunctions = async (
  appPath: string,
  currentEntryPoints: string[],
): Promise<void> => {
  const functionsDir = path.join(appPath, OUTPUT_DIR, FUNCTIONS_DIR);

  if (!(await fs.pathExists(functionsDir))) {
    return;
  }

  // Get expected output files from current entry points
  const expectedFiles = new Set(
    currentEntryPoints.map((entryPoint) => {
      const { relativePath } = computeFunctionOutputPath(entryPoint);
      return relativePath;
    }),
  );

  // Also include sourcemap files
  const expectedFilesWithMaps = new Set<string>();
  for (const file of expectedFiles) {
    expectedFilesWithMaps.add(file);
    expectedFilesWithMaps.add(`${file}.map`);
  }

  // Walk the functions directory and remove files not in expected set
  const removeOrphans = async (dir: string, relativeBase: string = ''): Promise<void> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await removeOrphans(fullPath, relativePath);
        // Remove empty directories
        const remaining = await fs.readdir(fullPath);
        if (remaining.length === 0) {
          await fs.remove(fullPath);
        }
      } else if (entry.isFile()) {
        if (!expectedFilesWithMaps.has(relativePath)) {
          await fs.remove(fullPath);
        }
      }
    }
  };

  await removeOrphans(functionsDir);
};

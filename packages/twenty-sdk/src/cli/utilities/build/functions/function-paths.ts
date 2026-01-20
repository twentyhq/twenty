import { OUTPUT_DIR } from '../common/constants';
import { FUNCTIONS_DIR } from './constants';
import * as fs from 'fs-extra';
import path from 'path';

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

export const buildFunctionEntries = (
  appPath: string,
  handlerPaths: Array<{ handlerPath: string }>,
): Record<string, string> => {
  const entries: Record<string, string> = {};

  for (const fn of handlerPaths) {
    const { relativePath } = computeFunctionOutputPath(fn.handlerPath);
    const chunkName = relativePath.replace(/\.js$/, '');
    entries[chunkName] = path.join(appPath, fn.handlerPath);
  }

  return entries;
};

export const cleanupOldFunctions = async (
  appPath: string,
  currentEntryPoints: string[],
): Promise<void> => {
  const functionsDir = path.join(appPath, OUTPUT_DIR, FUNCTIONS_DIR);

  if (!(await fs.pathExists(functionsDir))) {
    return;
  }

  const expectedFiles = new Set(
    currentEntryPoints.map((entryPoint) => {
      const { relativePath } = computeFunctionOutputPath(entryPoint);
      return relativePath;
    }),
  );

  const expectedFilesWithMaps = new Set<string>();
  for (const file of expectedFiles) {
    expectedFilesWithMaps.add(file);
    expectedFilesWithMaps.add(`${file}.map`);
  }

  const removeOrphanedFiles = async (dir: string, relativeBase: string = ''): Promise<void> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await removeOrphanedFiles(fullPath, relativePath);
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

  await removeOrphanedFiles(functionsDir);
};

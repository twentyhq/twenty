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

import path from 'path';

/**
 * Converts function entry points (handler paths) to Rollup input format.
 *
 * @example
 * Input:  ['src/app/hello.function.ts', 'src/app/utils/greet.function.ts']
 * Output: {
 *   'hello.function': '/abs/path/src/app/hello.function.ts',
 *   'greet.function': '/abs/path/src/app/utils/greet.function.ts'
 * }
 */
export const buildRollupInput = (
  appPath: string,
  entryPoints: string[],
): Record<string, string> => {
  const input: Record<string, string> = {};

  for (const entryPoint of entryPoints) {
    // Use the filename (without extension) as the chunk name
    const baseName = path.basename(entryPoint, '.ts');
    const absolutePath = path.join(appPath, entryPoint);

    input[baseName] = absolutePath;
  }

  return input;
};

/**
 * Extracts function entry points (handler paths) from serverless functions.
 * Returns sorted array for consistent comparison.
 */
export const extractFunctionEntryPoints = (
  serverlessFunctions: Array<{ handlerPath: string }>,
): string[] => {
  return serverlessFunctions.map((fn) => fn.handlerPath).sort();
};

/**
 * Compares two entry point arrays to check if they've changed.
 * Arrays must be sorted for accurate comparison.
 */
export const haveFunctionEntryPointsChanged = (
  currentEntryPoints: string[],
  newEntryPoints: string[],
): boolean => {
  if (currentEntryPoints.length !== newEntryPoints.length) {
    return true;
  }

  return newEntryPoints.some(
    (entryPoint, index) => entryPoint !== currentEntryPoints[index],
  );
};

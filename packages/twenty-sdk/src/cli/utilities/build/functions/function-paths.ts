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

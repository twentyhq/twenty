export const computeFunctionOutputPath = (handlerPath: string): string => {
  const normalizedPath = handlerPath.replace(/\\/g, '/');

  let relativePath = normalizedPath;
  if (relativePath.startsWith('src/')) {
    relativePath = relativePath.slice('src/'.length);
  }

  return relativePath.replace(/\.ts$/, '.js');
};

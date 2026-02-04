export const getRelativePathFromBase = (
  handlerPath: string,
  baseFolderPath: string,
): string => {
  return handlerPath.replace(`${baseFolderPath}/`, '');
};

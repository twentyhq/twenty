import { dirname } from 'path';

export const getLogicFunctionBaseFolderPath = (handlerPath: string): string => {
  return dirname(dirname(handlerPath));
};

export const getRelativePathFromBase = (
  handlerPath: string,
  baseFolderPath: string,
): string => {
  return handlerPath.replace(`${baseFolderPath}/`, '');
};

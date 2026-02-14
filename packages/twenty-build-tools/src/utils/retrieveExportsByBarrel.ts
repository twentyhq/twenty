import { type ExportByBarrel } from '../types/ExportByBarrel';

import { findAllExports } from './findAllExports';
import { getLastPathFolder } from './getLastPathFolder';

export const retrieveExportsByBarrel = (
  barrelDirectories: string[],
  srcPath: string,
) => {
  return barrelDirectories.map<ExportByBarrel>((moduleDirectory) => {
    const moduleExportsPerFile = findAllExports(moduleDirectory, srcPath);
    const moduleName = getLastPathFolder(moduleDirectory);

    if (!moduleName) {
      throw new Error(
        `Should never occur moduleName not found ${moduleDirectory}`,
      );
    }

    return {
      barrel: {
        moduleName,
        moduleDirectory,
      },
      allFileExports: moduleExportsPerFile,
    };
  });
};

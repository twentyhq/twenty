import path from 'path';
import * as fs from 'fs-extra';

export const findPathFile = async (
  appPath: string,
  fileName: string,
): Promise<string> => {
  const jsonPath = path.join(appPath, fileName);

  if (await fs.pathExists(jsonPath)) {
    return jsonPath;
  }

  throw new Error(`${fileName} not found in ${appPath}`);
};

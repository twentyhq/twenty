import path from 'path';

import { pathExists } from '@/cli/utilities/file/fs-utils';

export const findPathFile = async (
  appPath: string,
  fileName: string,
): Promise<string> => {
  const jsonPath = path.join(appPath, fileName);

  if (await pathExists(jsonPath)) {
    return jsonPath;
  }

  throw new Error(`${fileName} not found in ${appPath}`);
};

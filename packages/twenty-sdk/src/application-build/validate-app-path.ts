import { stat } from 'node:fs/promises';
import { isAbsolute } from 'node:path';

import { type BuildResult } from '@/application-build/types';

export const validateAppPath = async (
  appPath: string,
): Promise<BuildResult<null>> => {
  if (
    isAbsolute(appPath) &&
    (await stat(appPath).catch(() => null))?.isDirectory()
  ) {
    return { success: true, data: null, diagnostics: [] };
  }

  return {
    success: false,
    error: {
      code: 'INVALID_APP_PATH',
      message: 'appPath must be an absolute path to an existing directory.',
    },
    diagnostics: [],
  };
};

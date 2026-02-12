import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { join } from 'path';

export const formatPath = (appPath?: string) => {
  return appPath && !appPath?.startsWith('/')
    ? join(CURRENT_EXECUTION_DIRECTORY, appPath)
    : appPath;
};

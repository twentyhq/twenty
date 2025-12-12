import { join } from 'path';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/constants/current-execution-directory';

export const formatPath = (appPath?: string) => {
  return appPath && !appPath?.startsWith('/')
    ? join(CURRENT_EXECUTION_DIRECTORY, appPath)
    : appPath;
};

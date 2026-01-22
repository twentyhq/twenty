import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import { join, posix, relative, sep } from 'path';

export const formatPath = (appPath?: string) => {
  return appPath && !appPath?.startsWith('/')
    ? join(CURRENT_EXECUTION_DIRECTORY, appPath)
    : appPath;
};

export const toPosixRelative = (filepath: string, basePath: string): string => {
  const rel = relative(basePath, filepath);
  return rel.split(sep).join(posix.sep);
};

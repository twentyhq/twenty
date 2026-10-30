import { relative } from 'node:path';

import { isInsideDirectory } from '@/utils/is-inside-directory';

export const formatDisplayPath = ({
  workingDirectory,
  targetPath,
}: {
  workingDirectory: string;
  targetPath: string;
}) => {
  const relativePath = relative(workingDirectory, targetPath);

  if (relativePath === '') {
    return '.';
  }

  return isInsideDirectory({
    filePath: targetPath,
    directory: workingDirectory,
  })
    ? relativePath
    : targetPath;
};

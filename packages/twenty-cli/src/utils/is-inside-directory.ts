import { isAbsolute, relative, sep } from 'node:path';

import { isNonEmptyString } from '@sniptt/guards';

export const isInsideDirectory = ({
  filePath,
  directory,
}: {
  filePath: string;
  directory: string;
}) => {
  const relativePath = relative(directory, filePath);

  return (
    isNonEmptyString(relativePath) &&
    relativePath !== '..' &&
    !relativePath.startsWith(`..${sep}`) &&
    !isAbsolute(relativePath)
  );
};

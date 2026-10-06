import { copyFile } from 'node:fs/promises';

import { copy } from '@/app/fs-utils';

export const copyBuildFile = ({
  sourcePath,
  destinationPath,
  dereferenceSymlinks = false,
}: {
  sourcePath: string;
  destinationPath: string;
  dereferenceSymlinks?: boolean;
}): Promise<void> => {
  if (dereferenceSymlinks) {
    return copyFile(sourcePath, destinationPath);
  }

  return copy(sourcePath, destinationPath);
};

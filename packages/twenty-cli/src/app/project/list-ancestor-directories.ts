import { dirname } from 'node:path';

export const listAncestorDirectories = (directory: string): string[] => {
  const parentDirectory = dirname(directory);

  return parentDirectory === directory
    ? [directory]
    : [directory, ...listAncestorDirectories(parentDirectory)];
};

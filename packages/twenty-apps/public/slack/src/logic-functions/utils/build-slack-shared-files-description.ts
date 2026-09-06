import { isNonEmptyArray } from '@sniptt/guards';

export const buildSlackSharedFilesDescription = (
  fileNames: string[],
): string => {
  if (!isNonEmptyArray(fileNames)) {
    return '';
  }

  const sharedLabel =
    fileNames.length === 1 ? 'shared a file' : `shared ${fileNames.length} files`;

  return `${sharedLabel}: ${fileNames.join(', ')}`;
};

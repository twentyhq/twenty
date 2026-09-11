import { isNonEmptyArray } from '@sniptt/guards';

const stripBracketDelimiters = (fileName: string): string =>
  fileName.replace(/[[\]]/g, '');

export const buildSlackSharedFilesDescription = (
  fileNames: string[],
): string => {
  if (!isNonEmptyArray(fileNames)) {
    return '';
  }

  const sharedLabel =
    fileNames.length === 1
      ? 'shared a file'
      : `shared ${fileNames.length} files`;

  return `${sharedLabel}: ${fileNames.map(stripBracketDelimiters).join(', ')}`;
};

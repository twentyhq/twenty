import { BadRequestException } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

export const removeFileFolderFromFileEntityPath = (path: string): string => {
  const [fileFolder, ..._path] = path.split('/');

  if (!Object.values(FileFolder).includes(fileFolder as FileFolder))
    throw new BadRequestException(`File folder ${fileFolder} is not allowed`);

  return path.replace(`${fileFolder}/`, '');
};

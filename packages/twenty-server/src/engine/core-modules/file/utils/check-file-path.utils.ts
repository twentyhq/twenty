import { BadRequestException } from '@nestjs/common';

import {
  type AllowedFolders,
  FileFolder,
} from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { kebabCase } from 'src/utils/kebab-case';
import { settings } from 'src/engine/constants/settings';

export const checkFilePath = (filePath: string): string => {
  const allowedFolders = Object.values(FileFolder).map((value) =>
    kebabCase(value),
  );

  const sanitizedFilePath = filePath.replace(/\0/g, '');
  const [folder, size] = sanitizedFilePath.split('/');

  if (!allowedFolders.includes(folder as AllowedFolders)) {
    throw new BadRequestException(`Folder ${folder} is not allowed`);
  }

  if (
    folder !== kebabCase(FileFolder.ServerlessFunction) &&
    size &&
    // @ts-expect-error legacy noImplicitAny
    !settings.storage.imageCropSizes[folder]?.includes(size)
  ) {
    throw new BadRequestException(`Size ${size} is not allowed`);
  }

  return sanitizedFilePath;
};

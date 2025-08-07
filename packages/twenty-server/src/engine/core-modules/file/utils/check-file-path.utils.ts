import { BadRequestException } from '@nestjs/common';

import {
  AllowedFolders,
  FileFolder,
} from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { settings } from 'src/engine/constants/settings';
import { ShortCropSize } from 'src/utils/image';
import { kebabCase } from 'src/utils/kebab-case';

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
    !settings.storage.imageCropSizes[
      folder as keyof typeof settings.storage.imageCropSizes
    ]?.includes(size as ShortCropSize)
  ) {
    throw new BadRequestException(`Size ${size} is not allowed`);
  }

  return sanitizedFilePath;
};

import { BadRequestException } from '@nestjs/common';

import {
  type AllowedFolders,
  FileFolder,
} from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { kebabCase } from 'src/utils/kebab-case';

export const checkFileFolder = (filePath: string): FileFolder => {
  const allowedFolders = Object.values(FileFolder).map((value) =>
    kebabCase(value),
  );

  const sanitizedFilePath = filePath.replace(/\0/g, '');
  const [rootFolder] = sanitizedFilePath.split('/');

  if (!allowedFolders.includes(rootFolder as AllowedFolders)) {
    throw new BadRequestException(`Folder ${rootFolder} is not allowed`);
  }

  return rootFolder as FileFolder;
};

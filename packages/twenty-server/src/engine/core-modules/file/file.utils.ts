import { BadRequestException } from '@nestjs/common';

import { basename } from 'path';

import { KebabCase } from 'type-fest';

import { settings } from 'src/engine/constants/settings';
import { kebabCase } from 'src/utils/kebab-case';

import { FileFolder } from './interfaces/file-folder.interface';

type AllowedFolders = KebabCase<keyof typeof FileFolder>;

export const checkFilePath = (filePath: string): string => {
  const allowedFolders = Object.values(FileFolder).map((value) =>
    kebabCase(value),
  );

  const sanitizedFilePath = filePath.replace(/\0/g, '');
  const { folder, size, workspaceFolder } = getFilePathParts(sanitizedFilePath);

  if (workspaceFolder && !workspaceFolder.startsWith('workspace-')) {
    throw new BadRequestException(
      `Not a workspace specific folder. Access not allowed.`,
    );
  }

  if (!allowedFolders.includes(folder as AllowedFolders)) {
    throw new BadRequestException(`Folder ${folder} is not allowed`);
  }

  if (size && !settings.storage.imageCropSizes[folder]?.includes(size)) {
    throw new BadRequestException(`Size ${size} is not allowed`);
  }

  return sanitizedFilePath;
};

export const checkFilename = (filename: string) => {
  const sanitizedFilename = basename(filename.replace(/\0/g, ''));

  if (
    !sanitizedFilename ||
    sanitizedFilename.includes('/') ||
    sanitizedFilename.includes('\\') ||
    !sanitizedFilename.includes('.')
  ) {
    throw new BadRequestException(`Filename is not allowed`);
  }

  return basename(sanitizedFilename);
};

const getFilePathParts = (sanitizedFilePath: string) => {
  const pathParts = sanitizedFilePath.split('/');

  if (pathParts.length === 3) {
    const [workspaceFolder, folder, size] = pathParts;

    return {
      workspaceFolder,
      folder,
      size,
    };
  }

  const [folder, size] = sanitizedFilePath.split('/');

  return {
    folder,
    size,
  };
};

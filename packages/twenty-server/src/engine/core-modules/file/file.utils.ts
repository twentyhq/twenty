import { BadRequestException } from '@nestjs/common';

import { basename } from 'path';

import { KebabCase } from 'type-fest';
import { Request } from 'express';

import { settings } from 'src/engine/constants/settings';
import { kebabCase } from 'src/utils/kebab-case';

import {
  FileFolder,
  fileFolderConfigs,
} from './interfaces/file-folder.interface';

type AllowedFolders = KebabCase<keyof typeof FileFolder>;

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

export const extractFileInfoFromRequest = (request: Request) => {
  const filename = request.params.filename;

  const parts = request.params[0].split('/');

  const fileSignature = parts.pop();

  const rawFolder = parts.join('/');

  const fileFolder = checkFileFolder(rawFolder);

  const ignoreExpirationToken =
    fileFolderConfigs[fileFolder].ignoreExpirationToken;

  return {
    filename,
    fileSignature,
    rawFolder,
    fileFolder,
    ignoreExpirationToken,
  };
};

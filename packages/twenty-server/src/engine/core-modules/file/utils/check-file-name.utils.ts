import { BadRequestException } from '@nestjs/common';

import { basename } from 'path';

export const checkFilename = (filename: string) => {
  const sanitizedFilename = filename.replace(/\0/g, '');

  if (
    !sanitizedFilename ||
    sanitizedFilename.includes('/') ||
    sanitizedFilename.includes('\\') ||
    !sanitizedFilename.includes('.')
  ) {
    throw new BadRequestException(`Filename '${filename}' is not allowed`);
  }

  return basename(sanitizedFilename);
};

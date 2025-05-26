import { BadRequestException } from '@nestjs/common';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { checkFileFolder } from 'src/engine/core-modules/file/utils/check-file-folder.utils';

describe('checkFileFolder', () => {
  it('should return the root folder when it is allowed', () => {
    expect(checkFileFolder(`${FileFolder.Attachment}/file.txt`)).toBe(
      FileFolder.Attachment,
    );
  });

  it('should throw BadRequestException for disallowed folders', () => {
    expect(() => checkFileFolder('invalid-folder/file.txt')).toThrow(
      BadRequestException,
    );
  });

  it('should sanitize null characters in file path', () => {
    expect(() => checkFileFolder('\0invalid-folder/file.txt')).toThrow(
      BadRequestException,
    );
  });

  it('should handle edge cases like empty file path', () => {
    expect(() => checkFileFolder('')).toThrow(BadRequestException);
  });

  it('should handle cases where filePath has no folder', () => {
    expect(() => checkFileFolder('file.txt')).toThrow(BadRequestException);
  });
});

import { BadRequestException } from '@nestjs/common';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import {
  checkFilename,
  checkFilePath,
  checkFileFolder,
} from 'src/engine/core-modules/file/file.utils';

describe('FileUtils', () => {
  describe('checkFilePath', () => {
    it('should return sanitized file path', () => {
      const filePath = `${FileFolder.Attachment}\0`;
      const sanitizedFilePath = checkFilePath(filePath);

      expect(sanitizedFilePath).toBe(`${FileFolder.Attachment}`);
    });

    it('should return sanitized file path with size', () => {
      const filePath = `${FileFolder.ProfilePicture}\0/original`;
      const sanitizedFilePath = checkFilePath(filePath);

      expect(sanitizedFilePath).toBe(`${FileFolder.ProfilePicture}/original`);
    });

    it('should throw an error for invalid image size', () => {
      const filePath = `${FileFolder.ProfilePicture}\0/invalid-size`;

      expect(() => checkFilePath(filePath)).toThrow(
        `Size invalid-size is not allowed`,
      );
    });

    it('should throw an error for invalid folder', () => {
      const filePath = `invalid-folder`;

      expect(() => checkFilePath(filePath)).toThrow(
        `Folder invalid-folder is not allowed`,
      );
    });
  });

  describe('checkFilename', () => {
    it('should return sanitized filename', () => {
      const filename = `${FileFolder.Attachment}\0.png`;
      const sanitizedFilename = checkFilename(filename);

      expect(sanitizedFilename).toBe(`${FileFolder.Attachment}.png`);
    });

    it('should throw an error for invalid filename', () => {
      const filename = `invalid-filename`;

      expect(() => checkFilename(filename)).toThrow(`Filename is not allowed`);
    });

    it('should throw an error for invalid filename', () => {
      const filename = `\0`;

      expect(() => checkFilename(filename)).toThrow(`Filename is not allowed`);
    });
  });

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
});

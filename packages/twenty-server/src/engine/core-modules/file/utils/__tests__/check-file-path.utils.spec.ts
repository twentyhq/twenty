import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { checkFilePath } from 'src/engine/core-modules/file/utils/check-file-path.utils';

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

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { checkFilename } from 'src/engine/core-modules/file/utils/check-file-name.utils';

describe('checkFilename', () => {
  it('should return sanitized filename', () => {
    const filename = `${FileFolder.Attachment}\0.png`;
    const sanitizedFilename = checkFilename(filename);

    expect(sanitizedFilename).toBe(`${FileFolder.Attachment}.png`);
  });

  it('should throw an error for invalid filename', () => {
    const filename = `invalid-filename`;

    expect(() => checkFilename(filename)).toThrow(
      `Filename 'invalid-filename' is not allowed`,
    );
  });

  it('should throw an error for invalid filename', () => {
    const filename = `\0`;

    expect(() => checkFilename(filename)).toThrow(
      `Filename '\0' is not allowed`,
    );
  });
});

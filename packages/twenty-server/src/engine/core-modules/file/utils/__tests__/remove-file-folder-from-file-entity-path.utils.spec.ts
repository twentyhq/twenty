import { BadRequestException } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';

describe('removeFileFolderFromFileEntityPath', () => {
  it('should remove file folder prefix from path', () => {
    expect(
      removeFileFolderFromFileEntityPath(`${FileFolder.Attachment}/file.txt`),
    ).toBe('file.txt');
  });

  it('should handle nested paths correctly', () => {
    expect(
      removeFileFolderFromFileEntityPath(
        `${FileFolder.Attachment}/subfolder/file.txt`,
      ),
    ).toBe('subfolder/file.txt');
  });

  it('should work with different valid file folders', () => {
    expect(
      removeFileFolderFromFileEntityPath(
        `${FileFolder.ProfilePicture}/avatar.png`,
      ),
    ).toBe('avatar.png');

    expect(
      removeFileFolderFromFileEntityPath(
        `${FileFolder.WorkspaceLogo}/logo.svg`,
      ),
    ).toBe('logo.svg');

    expect(
      removeFileFolderFromFileEntityPath(`${FileFolder.FilesField}/doc.pdf`),
    ).toBe('doc.pdf');
  });

  it('should throw BadRequestException for invalid file folder', () => {
    expect(() =>
      removeFileFolderFromFileEntityPath('invalid-folder/file.txt'),
    ).toThrow(BadRequestException);
  });
});

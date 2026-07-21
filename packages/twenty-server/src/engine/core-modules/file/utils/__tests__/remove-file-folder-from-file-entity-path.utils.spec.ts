import { BadRequestException } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';

describe('removeFileFolderFromFileEntityPath', () => {
  it('should remove file folder prefix from path', () => {
    expect(
      removeFileFolderFromFileEntityPath(`${FileFolder.FilesField}/file.txt`),
    ).toBe('file.txt');
  });

  it('should handle nested paths correctly', () => {
    expect(
      removeFileFolderFromFileEntityPath(
        `${FileFolder.FilesField}/subfolder/file.txt`,
      ),
    ).toBe('subfolder/file.txt');
  });

  it('should work with different valid file folders', () => {
    expect(
      removeFileFolderFromFileEntityPath(
        `${FileFolder.CorePicture}/avatar.png`,
      ),
    ).toBe('avatar.png');

    expect(
      removeFileFolderFromFileEntityPath(`${FileFolder.Workflow}/logo.svg`),
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

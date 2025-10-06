import { readS3FolderContent } from 'src/engine/core-modules/file-storage/utils/read-s3-folder-content';

describe('read-s3-folder-content', () => {
  it('should format files to sources properly', () => {
    const files = [
      { path: 'f1/file1.ts', fileContent: 'content1' },
      { path: 'f1/f11/file11.ts', fileContent: 'content11' },
      { path: 'f1/file2.ts', fileContent: 'content2' },
      { path: 'file3.ts', fileContent: 'content3' },
    ];

    const expectedResult = {
      'file3.ts': 'content3',
      f1: {
        'file1.ts': 'content1',
        'file2.ts': 'content2',
        f11: { 'file11.ts': 'content11' },
      },
    };

    const result = readS3FolderContent(files);

    expect(result).toEqual(expectedResult);
  });
});

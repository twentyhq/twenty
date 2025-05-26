import { Request } from 'express';

import { checkFilename } from 'src/engine/core-modules/file/utils/check-file-name.utils';
import { checkFileFolder } from 'src/engine/core-modules/file/utils/check-file-folder.utils';
import { extractFileInfoFromRequest } from 'src/engine/core-modules/file/utils/extract-file-info-from-request.utils';

jest.mock('src/engine/core-modules/file/utils/check-file-name.utils', () => ({
  checkFilename: jest.fn(),
}));

jest.mock('src/engine/core-modules/file/utils/check-file-folder.utils', () => ({
  checkFileFolder: jest.fn(),
}));

jest.mock(
  'src/engine/core-modules/file/interfaces/file-folder.interface',
  () => ({
    fileFolderConfigs: {
      'some-folder': { ignoreExpirationToken: true },
    },
  }),
);

describe('extractFileInfoFromRequest', () => {
  it('should extract all file info correctly from request', () => {
    const mockRequest = {
      params: {
        filename: 'myfile.txt',
        '0': 'some-folder/some-subfolder/filesig123',
      },
    } as unknown as Request;

    (checkFilename as jest.Mock).mockReturnValue('validated-file.txt');
    (checkFileFolder as jest.Mock).mockReturnValue('some-folder');

    const result = extractFileInfoFromRequest(mockRequest);

    expect(checkFilename).toHaveBeenCalledWith('myfile.txt');
    expect(checkFileFolder).toHaveBeenCalledWith('some-folder/some-subfolder');

    expect(result).toEqual({
      filename: 'validated-file.txt',
      fileSignature: 'filesig123',
      rawFolder: 'some-folder/some-subfolder',
      fileFolder: 'some-folder',
      ignoreExpirationToken: true,
    });
  });
});

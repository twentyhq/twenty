import { type Request } from 'express';

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
      attachment: { ignoreExpirationToken: true },
    },
  }),
);

describe('extractFileInfoFromRequest', () => {
  it('should extract all file info correctly from request', () => {
    const mockRequest = {
      params: {
        folder: 'attachment',
        token: 'filesig123',
        filename: 'myfile.txt',
      },
    } as unknown as Request;

    (checkFilename as jest.Mock).mockReturnValue('validated-file.txt');
    (checkFileFolder as jest.Mock).mockReturnValue('attachment');

    const result = extractFileInfoFromRequest(mockRequest);

    expect(checkFilename).toHaveBeenCalledWith('myfile.txt');
    expect(checkFileFolder).toHaveBeenCalledWith('attachment');

    expect(result).toEqual({
      filename: 'validated-file.txt',
      fileSignature: 'filesig123',
      rawFolder: 'attachment',
      fileFolder: 'attachment',
      ignoreExpirationToken: true,
    });
  });
});

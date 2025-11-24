import { type Request } from 'express';

import { checkFileFolder } from 'src/engine/core-modules/file/utils/check-file-folder.utils';
import { checkFilename } from 'src/engine/core-modules/file/utils/check-file-name.utils';
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
      attachment: { ignoreExpirationToken: false },
      'profile-picture': { ignoreExpirationToken: true },
    },
  }),
);

describe('extractFileInfoFromRequest', () => {
  it('should extract all file info correctly from 3-segment path', () => {
    const mockRequest = {
      path: '/files/attachment/filesig123/myfile.txt',
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
      ignoreExpirationToken: false,
    });
  });

  it('should extract all file info correctly from 4-segment path with size', () => {
    const mockRequest = {
      path: '/files/profile-picture/original/filesig456/avatar.jpg',
    } as unknown as Request;

    (checkFilename as jest.Mock).mockReturnValue('validated-avatar.jpg');
    (checkFileFolder as jest.Mock).mockReturnValue('profile-picture');

    const result = extractFileInfoFromRequest(mockRequest);

    expect(checkFilename).toHaveBeenCalledWith('avatar.jpg');
    expect(checkFileFolder).toHaveBeenCalledWith('profile-picture/original');

    expect(result).toEqual({
      filename: 'validated-avatar.jpg',
      fileSignature: 'filesig456',
      rawFolder: 'profile-picture/original',
      fileFolder: 'profile-picture',
      ignoreExpirationToken: true,
    });
  });
});

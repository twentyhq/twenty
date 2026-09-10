import bytes from 'bytes';
import { FileFolder } from 'twenty-shared/types';

import { settings } from 'src/engine/constants/settings';
import { FileUploadExceptionCode } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadTargetService } from 'src/engine/core-modules/file/file-upload/services/file-upload-target.service';

const MAX_DIRECT_UPLOAD_FILE_SIZE = bytes(
  settings.storage.maxDirectUploadFileSize,
) as number;

describe('FileUploadTargetService', () => {
  const fileStorageService = {
    createPendingFile: jest.fn(),
  };

  const buildService = () =>
    new FileUploadTargetService(
      fileStorageService as never,
      {} as never,
      {} as never,
    );

  const buildUploadTarget = (size: number) =>
    buildService().buildUploadTarget({
      workspaceId: '20202020-0000-4000-8000-000000000001',
      fileId: '20202020-0000-4000-8000-000000000002',
      fileFolder: FileFolder.Source,
      applicationUniversalIdentifier: '20202020-0000-4000-8000-000000000003',
      resourcePath: 'src/index.ts',
      contentType: 'application/octet-stream',
      size,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    fileStorageService.createPendingFile.mockResolvedValue({
      id: '20202020-0000-4000-8000-000000000002',
    });
  });

  it.each([0, -1, 1.5, MAX_DIRECT_UPLOAD_FILE_SIZE + 1])(
    'should refuse to hand out an upload url for size %s',
    async (size) => {
      await expect(buildUploadTarget(size)).rejects.toMatchObject({
        code: FileUploadExceptionCode.FILE_TOO_LARGE,
      });
    },
  );

  it('should turn an oversized file into a per-file error in a batch', async () => {
    const [result] = await buildService().createUploadTargetsBatch([
      {
        workspaceId: '20202020-0000-4000-8000-000000000001',
        applicationUniversalIdentifier: '20202020-0000-4000-8000-000000000003',
        fileFolder: FileFolder.Source,
        resourcePath: 'src/index.ts',
        size: MAX_DIRECT_UPLOAD_FILE_SIZE + 1,
        settings: { isTemporaryFile: false, toDelete: false },
      },
    ]);

    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Invalid file size'),
    });
  });
});

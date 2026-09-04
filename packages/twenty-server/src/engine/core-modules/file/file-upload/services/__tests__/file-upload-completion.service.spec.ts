import { Readable } from 'stream';

import { FileFolder } from 'twenty-shared/types';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { MAX_SANITIZABLE_SVG_BYTES } from 'src/engine/core-modules/file/file-upload/constants/max-sanitizable-svg-size.constant';
import { FileUploadExceptionCode } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadCompletionService } from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

describe('FileUploadCompletionService.completeUploadedFile', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const fileId = '20202020-0000-4000-8000-000000000002';

  const svgContent =
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
  const pngContent = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52,
  ]);

  let fileStorageService: jest.Mocked<FileStorageService>;
  let fileRepository: jest.Mocked<WorkspaceScopedRepository<FileEntity>>;

  const buildStorageLocation = (ext: string) => ({
    fileFolder: FileFolder.FilesField,
    applicationUniversalIdentifier: 'application-universal-identifier',
    workspaceId,
    resourcePath: `${fileId}.${ext}`,
  });

  const buildFile = (ext: string, size: number) =>
    ({
      id: fileId,
      path: `${FileFolder.FilesField}/${fileId}.${ext}`,
      size,
      status: FILE_STATUS.PENDING,
      mimeType: 'application/octet-stream',
      createdAt: new Date(),
    }) as FileEntity;

  const buildService = () =>
    new FileUploadCompletionService(fileStorageService, fileRepository);

  beforeEach(() => {
    fileStorageService = {
      getFileMetadata: jest.fn(),
      readFilePrefix: jest.fn().mockResolvedValue(Buffer.from(svgContent)),
      readFile: jest
        .fn()
        .mockImplementation(async () => Readable.from(Buffer.from(svgContent))),
      writeFileStream: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<FileStorageService>;

    fileRepository = {
      update: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<WorkspaceScopedRepository<FileEntity>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should refuse an SVG larger than the sanitizable limit without reading it', async () => {
    const size = MAX_SANITIZABLE_SVG_BYTES + 1;

    fileStorageService.getFileMetadata.mockResolvedValue({ size });

    await expect(
      buildService().completeUploadedFile({
        workspaceId,
        file: buildFile('svg', size),
        storageLocation: buildStorageLocation('svg'),
      }),
    ).rejects.toMatchObject({
      code: FileUploadExceptionCode.FILE_TOO_LARGE,
    });

    expect(fileStorageService.readFile).not.toHaveBeenCalled();
    expect(fileRepository.update).not.toHaveBeenCalled();
  });

  it('should sanitize an SVG within the limit and store its new size', async () => {
    const size = Buffer.byteLength(svgContent);

    fileStorageService.getFileMetadata.mockResolvedValue({ size });

    const completedFile = await buildService().completeUploadedFile({
      workspaceId,
      file: buildFile('svg', size),
      storageLocation: buildStorageLocation('svg'),
    });

    expect(completedFile.mimeType).toBe('image/svg+xml');
    expect(completedFile.size).toBeLessThan(size);
    expect(fileStorageService.writeFileStream).toHaveBeenCalledTimes(1);
    expect(fileRepository.update).toHaveBeenCalledWith(
      workspaceId,
      { id: fileId },
      expect.objectContaining({
        status: FILE_STATUS.UPLOADED,
        mimeType: 'image/svg+xml',
        size: completedFile.size,
      }),
    );
  });

  it('should not read a file that does not need sanitizing', async () => {
    const size = pngContent.length;

    fileStorageService.getFileMetadata.mockResolvedValue({ size });
    fileStorageService.readFilePrefix.mockResolvedValue(pngContent);

    const completedFile = await buildService().completeUploadedFile({
      workspaceId,
      file: buildFile('png', size),
      storageLocation: buildStorageLocation('png'),
    });

    expect(completedFile.mimeType).toBe('image/png');
    expect(completedFile.size).toBe(size);
    expect(fileStorageService.readFile).not.toHaveBeenCalled();
    expect(fileStorageService.writeFileStream).not.toHaveBeenCalled();
  });
});

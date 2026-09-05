import { Readable } from 'stream';

import { FileFolder } from 'twenty-shared/types';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { MAX_SANITIZABLE_SVG_BYTES } from 'src/engine/core-modules/file/file-upload/constants/max-sanitizable-svg-size.constant';
import { FileUploadExceptionCode } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadCompletionService } from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { buildPendingUploadResourcePath } from 'src/engine/core-modules/file/file-upload/utils/build-pending-upload-resource-path.util';
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
      move: jest.fn().mockResolvedValue(undefined),
      deleteFileObject: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<FileStorageService>;

    fileRepository = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    } as unknown as jest.Mocked<WorkspaceScopedRepository<FileEntity>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should refuse an SVG larger than the sanitizable limit without reading it', async () => {
    const size = MAX_SANITIZABLE_SVG_BYTES + 1;

    fileStorageService.getFileMetadata.mockResolvedValue({
      size,
      checksum: '"etag-a"',
    });

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

  it('should report an oversized read as FILE_TOO_LARGE when storage understated the size', async () => {
    const declaredSize = 1024;

    fileStorageService.getFileMetadata.mockResolvedValue({
      size: declaredSize,
      checksum: '"etag-a"',
    });
    fileStorageService.readFile.mockResolvedValue(
      Readable.from(Buffer.alloc(MAX_SANITIZABLE_SVG_BYTES + 1)),
    );

    await expect(
      buildService().completeUploadedFile({
        workspaceId,
        file: buildFile('svg', declaredSize),
        storageLocation: buildStorageLocation('svg'),
      }),
    ).rejects.toMatchObject({
      code: FileUploadExceptionCode.FILE_TOO_LARGE,
    });

    expect(fileRepository.update).not.toHaveBeenCalled();
  });

  it('should refuse to promote a sanitized SVG whose new identity is unreadable', async () => {
    const size = Buffer.byteLength(svgContent);

    fileStorageService.getFileMetadata
      .mockResolvedValueOnce({ size, checksum: '"etag-a"' })
      .mockResolvedValueOnce(null);

    await expect(
      buildService().completeUploadedFile({
        workspaceId,
        file: buildFile('svg', size),
        storageLocation: buildStorageLocation('svg'),
      }),
    ).rejects.toMatchObject({
      code: FileUploadExceptionCode.STORAGE_INCONSISTENT,
    });

    expect(fileStorageService.move).not.toHaveBeenCalled();
  });

  it('should refuse to promote a sanitized SVG that lost its version identity', async () => {
    const size = Buffer.byteLength(svgContent);

    fileStorageService.getFileMetadata
      .mockResolvedValueOnce({ size, checksum: '"etag-a"' })
      .mockResolvedValueOnce({ size: 10 });

    await expect(
      buildService().completeUploadedFile({
        workspaceId,
        file: buildFile('svg', size),
        storageLocation: buildStorageLocation('svg'),
      }),
    ).rejects.toMatchObject({
      code: FileUploadExceptionCode.STORAGE_INCONSISTENT,
    });

    expect(fileStorageService.move).not.toHaveBeenCalled();
  });

  it('should promote a sanitized SVG under the identity it has after the rewrite', async () => {
    const size = Buffer.byteLength(svgContent);

    fileStorageService.getFileMetadata
      .mockResolvedValueOnce({ size, checksum: '"etag-before"' })
      .mockResolvedValueOnce({ size: 10, checksum: '"etag-after"' });

    await buildService().completeUploadedFile({
      workspaceId,
      file: buildFile('svg', size),
      storageLocation: buildStorageLocation('svg'),
    });

    expect(fileStorageService.move).toHaveBeenCalledWith(
      expect.objectContaining({ ifMatchChecksum: '"etag-after"' }),
    );
  });

  it('should sanitize an SVG within the limit and store its new size', async () => {
    const size = Buffer.byteLength(svgContent);

    fileStorageService.getFileMetadata.mockResolvedValue({
      size,
      checksum: '"etag-a"',
    });

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

    fileStorageService.getFileMetadata.mockResolvedValue({
      size,
      checksum: '"etag-a"',
    });
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

  it('should validate the quarantined object and move it to its final path', async () => {
    const size = pngContent.length;
    const storageLocation = buildStorageLocation('png');
    const pendingResourcePath = buildPendingUploadResourcePath({
      fileId,
      resourcePath: storageLocation.resourcePath,
    });

    fileStorageService.getFileMetadata.mockResolvedValue({
      size,
      checksum: '"etag-a"',
    });
    fileStorageService.readFilePrefix.mockResolvedValue(pngContent);

    await buildService().completeUploadedFile({
      workspaceId,
      file: buildFile('png', size),
      storageLocation,
    });

    expect(fileStorageService.getFileMetadata).toHaveBeenCalledWith(
      expect.objectContaining({ resourcePath: pendingResourcePath }),
    );
    expect(fileStorageService.readFilePrefix).toHaveBeenCalledWith(
      expect.objectContaining({ resourcePath: pendingResourcePath }),
    );
    expect(fileStorageService.move).toHaveBeenCalledWith({
      from: expect.objectContaining({ resourcePath: pendingResourcePath }),
      to: storageLocation,
      ifMatchChecksum: '"etag-a"',
    });
  });

  it('should not complete an upload from an object left at the final path', async () => {
    const size = pngContent.length;
    const storageLocation = buildStorageLocation('png');

    fileStorageService.getFileMetadata.mockImplementation(async (location) =>
      location.resourcePath === storageLocation.resourcePath
        ? { size, checksum: '"etag-of-a-previous-upload"' }
        : null,
    );

    await expect(
      buildService().completeUploadedFile({
        workspaceId,
        file: buildFile('png', size),
        storageLocation,
      }),
    ).rejects.toMatchObject({
      code: FileUploadExceptionCode.FILE_NOT_UPLOADED,
    });

    expect(fileStorageService.move).not.toHaveBeenCalled();
    expect(fileRepository.update).not.toHaveBeenCalled();
  });

  it('should fail without touching storage when the row was reaped mid-completion', async () => {
    const size = pngContent.length;

    fileStorageService.getFileMetadata.mockResolvedValue({
      size,
      checksum: '"etag-a"',
    });
    fileStorageService.readFilePrefix.mockResolvedValue(pngContent);
    fileRepository.update.mockResolvedValue({
      affected: 0,
      raw: [],
      generatedMaps: [],
    });

    await expect(
      buildService().completeUploadedFile({
        workspaceId,
        file: buildFile('png', size),
        storageLocation: buildStorageLocation('png'),
      }),
    ).rejects.toMatchObject({
      code: FileUploadExceptionCode.FILE_NOT_FOUND,
    });

    // Deliberately orphaned: this path cannot prove the object is still the
    // one it promoted, and a later upload may own it by now.
    expect(fileStorageService.deleteFileObject).not.toHaveBeenCalled();
  });

  it('should leave the promoted object alone on a successful completion', async () => {
    const size = pngContent.length;

    fileStorageService.getFileMetadata.mockResolvedValue({
      size,
      checksum: '"etag-a"',
    });
    fileStorageService.readFilePrefix.mockResolvedValue(pngContent);

    await buildService().completeUploadedFile({
      workspaceId,
      file: buildFile('png', size),
      storageLocation: buildStorageLocation('png'),
    });

    expect(fileStorageService.deleteFileObject).not.toHaveBeenCalled();
  });
});

import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import { FileFolder } from 'twenty-shared/types';

import { ApplicationFileUploadService } from 'src/engine/core-modules/application/application-development/application-file-upload.service';
import { type ApplicationFileUploadRequestInput } from 'src/engine/core-modules/application/application-development/dtos/create-application-file-uploads.input';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';

describe('ApplicationFileUploadService file reuse', () => {
  const workspaceId = '20202020-0000-4000-8000-000000000001';
  const applicationUniversalIdentifier = '20202020-0000-4000-8000-000000000002';
  const applicationId = '20202020-0000-4000-8000-000000000003';
  const contents = Buffer.from('export const main = () => "hello";');
  const file: ApplicationFileUploadRequestInput = {
    fileFolder: FileFolder.BuiltLogicFunction,
    filePath: 'handler.mjs',
    size: contents.length,
    sha256: createHash('sha256').update(contents).digest('hex'),
  };
  const storage = { getFileMetadata: jest.fn(), readFile: jest.fn() };
  const lookup = { findByUniversalIdentifier: jest.fn() };
  const targets = { createUploadTargetsBatch: jest.fn() };
  const repository = { find: jest.fn() };
  const service = new ApplicationFileUploadService(
    storage as never,
    lookup as never,
    targets as never,
    {} as never,
    repository as never,
  );
  const reserve = (files = [file]) =>
    service.createApplicationFileUploads({
      workspaceId,
      applicationUniversalIdentifier,
      files,
    });

  beforeEach(() => {
    jest.resetAllMocks();
    storage.getFileMetadata.mockResolvedValue({
      size: contents.length,
      checksum: 'storage-version',
    });
    storage.readFile.mockImplementation(async () => Readable.from([contents]));
    lookup.findByUniversalIdentifier.mockResolvedValue({ id: applicationId });
    repository.find.mockResolvedValue([
      { path: `${file.fileFolder}/${file.filePath}` },
    ]);
    targets.createUploadTargetsBatch.mockImplementation(
      async (requests: { resourcePath: string }[]) =>
        requests.map((request) => ({
          success: true,
          value: {
            fileId: request.resourcePath,
            uploadUrl: 'https://storage.example/upload',
          },
        })),
    );
  });

  it('reuses completed files only after checking the bytes in this workspace and app', async () => {
    const result = await reserve();

    expect(result.targets).toEqual([]);
    expect(result.unchangedFiles).toEqual([
      { fileFolder: file.fileFolder, filePath: file.filePath },
    ]);
    expect(repository.find).toHaveBeenCalledWith(workspaceId, {
      where: expect.objectContaining({
        applicationId,
        status: FILE_STATUS.UPLOADED,
      }),
    });
    expect(storage.readFile).toHaveBeenCalledWith({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: file.fileFolder,
      resourcePath: file.filePath,
    });
    expect(targets.createUploadTargetsBatch).toHaveBeenCalledWith([]);
  });

  it('requests a new upload for different bytes of the same size', async () => {
    storage.readFile.mockImplementation(async () =>
      Readable.from([Buffer.alloc(contents.length)]),
    );
    const result = await reserve();

    expect(result.unchangedFiles).toEqual([]);
    expect(result.targets).toHaveLength(1);
  });

  it('checks each file independently and preserves the association with its upload target', async () => {
    const changedFile = { ...file, filePath: 'changed.mjs' };
    const result = await reserve([file, changedFile]);

    expect(result.unchangedFiles).toEqual([
      { fileFolder: file.fileFolder, filePath: file.filePath },
    ]);
    expect(result.targets).toEqual([
      expect.objectContaining({
        filePath: changedFile.filePath,
        fileId: changedFile.filePath,
      }),
    ]);
  });

  it('does not reuse a missing, pending or other-app database entry', async () => {
    repository.find.mockResolvedValue([]);
    const result = await reserve();

    expect(result.targets).toHaveLength(1);
    expect(storage.readFile).not.toHaveBeenCalled();
  });

  it.each([
    null,
    { size: contents.length + 1, checksum: 'version' },
    { size: contents.length },
  ])(
    'uploads again when storage cannot confirm the file: %j',
    async (metadata) => {
      storage.getFileMetadata.mockResolvedValue(metadata);
      const result = await reserve();

      expect(result.targets).toHaveLength(1);
      expect(result.unchangedFiles).toEqual([]);
      expect(storage.readFile).not.toHaveBeenCalled();
    },
  );

  it('does not reuse a file replaced while its checksum was being computed', async () => {
    storage.getFileMetadata
      .mockResolvedValueOnce({ size: contents.length, checksum: 'before' })
      .mockResolvedValueOnce({ size: contents.length, checksum: 'after' });
    const result = await reserve();

    expect(result.targets).toHaveLength(1);
    expect(result.unchangedFiles).toEqual([]);
  });

  it('falls back to upload when reading existing storage fails', async () => {
    storage.readFile.mockRejectedValue(new Error('File disappeared'));
    const result = await reserve();

    expect(result.targets).toHaveLength(1);
    expect(result.unchangedFiles).toEqual([]);
  });

  it('stops reading an object that exceeds its declared size', async () => {
    const stream = Readable.from([Buffer.alloc(contents.length + 1)]);
    storage.readFile.mockResolvedValue(stream);
    const result = await reserve();

    expect(result.targets).toHaveLength(1);
    expect(stream.destroyed).toBe(true);
  });

  it('preserves unconditional uploads for clients that omit hashes', async () => {
    const result = await reserve([{ ...file, sha256: undefined }]);

    expect(result.targets).toHaveLength(1);
    expect(repository.find).not.toHaveBeenCalled();
    expect(storage.readFile).not.toHaveBeenCalled();
  });

  it('validates paths before reading storage or reserving uploads', async () => {
    const result = await reserve([{ ...file, filePath: '../../escape.mjs' }]);

    expect(result.errors).toHaveLength(1);
    expect(result.targets).toEqual([]);
    expect(result.unchangedFiles).toEqual([]);
    expect(storage.readFile).not.toHaveBeenCalled();
  });
});

import { ApiError, Storage } from '@google-cloud/storage';

import { PassThrough, type Readable } from 'stream';

import { GcsDriver } from 'src/engine/core-modules/file-storage/drivers/gcs.driver';
import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

// Mirrors the library: the request starts on the first read, then emits `response` and either data or an error.
const mockBuildReadStream = (outcome: { statusCode: number } | Error) => {
  const stream = new PassThrough();
  let hasRequested = false;

  stream._read = () => {
    if (hasRequested) {
      return;
    }

    hasRequested = true;

    if (outcome instanceof Error) {
      stream.emit('response', { statusCode: 404 });
      stream.emit('error', outcome);

      return;
    }

    stream.emit('response', outcome);
    stream.push(Buffer.from('content'));
    stream.push(null);
  };

  return stream;
};

type MockFile = ReturnType<typeof mockBuildFile>;

const mockBuildFile = (
  name: string,
  options?: { generation?: number | string },
) => ({
  name,
  options,
  createReadStream: jest.fn(
    (): Readable => mockBuildReadStream({ statusCode: 200 }),
  ),
  download: jest.fn(),
  save: jest.fn(),
  createWriteStream: jest.fn(),
  getMetadata: jest.fn(),
  delete: jest.fn(),
  copy: jest.fn(),
  exists: jest.fn(),
  getSignedUrl: jest.fn(),
  setMetadata: jest.fn(),
});

const mockFiles: MockFile[] = [];
let mockConfigureFile: (file: MockFile) => void = () => {};

const mockBucket = {
  file: jest.fn((name: string, options?: { generation?: number | string }) => {
    const file = mockBuildFile(name, options);

    mockConfigureFile(file);
    mockFiles.push(file);

    return file;
  }),
  getFiles: jest.fn(),
  deleteFiles: jest.fn(),
};

jest.mock('@google-cloud/storage', () => {
  const actual = jest.requireActual('@google-cloud/storage');

  return {
    ...actual,
    Storage: jest.fn().mockImplementation(() => ({
      bucket: jest.fn(() => mockBucket),
    })),
  };
});

const buildApiError = (code: number) =>
  Object.assign(new ApiError(`GCS responded with ${code}`), { code });

const filesNamed = (name: string) =>
  mockFiles.filter((file) => file.name === name);

const createDriver = (options: { presignEnabled?: boolean } = {}) =>
  new GcsDriver({ bucketName: 'test-bucket', ...options });

describe('GcsDriver', () => {
  beforeEach(() => {
    mockFiles.length = 0;
    mockConfigureFile = () => {};
  });

  afterEach(() => {
    jest.setSystemTime(jest.getRealSystemTime());
  });

  it('should authenticate through Application Default Credentials', () => {
    new GcsDriver({ bucketName: 'test-bucket', projectId: 'test-project' });

    expect(Storage).toHaveBeenCalledWith({ projectId: 'test-project' });
  });

  describe('readFile', () => {
    it('should read only the requested byte range', async () => {
      const stream = await createDriver().readFile({
        filePath: 'recordings/video.mp4',
        byteRange: { startByte: 100, endByte: 199 },
      });

      expect(mockFiles[0].name).toBe('recordings/video.mp4');
      expect(mockFiles[0].createReadStream).toHaveBeenCalledWith({
        start: 100,
        end: 199,
      });
      expect((stream.read() as Buffer).toString()).toBe('content');
    });

    it('should reject a missing object with FILE_NOT_FOUND before the caller consumes it', async () => {
      mockConfigureFile = (file) => {
        file.createReadStream.mockImplementation(() =>
          mockBuildReadStream(buildApiError(404)),
        );
      };

      await expect(
        createDriver().readFile({ filePath: 'attachments/missing.pdf' }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.FILE_NOT_FOUND,
      });
    });

    it('should not report a storage failure as a missing object', async () => {
      mockConfigureFile = (file) => {
        file.createReadStream.mockImplementation(() =>
          mockBuildReadStream(buildApiError(503)),
        );
      };

      await expect(
        createDriver().readFile({ filePath: 'attachments/file.pdf' }),
      ).rejects.toMatchObject({ code: 503 });
    });
  });

  describe('readFilePrefix', () => {
    it('should download only the leading byte range', async () => {
      mockConfigureFile = (file) => {
        file.download.mockResolvedValue([Buffer.from('prefix')]);
      };

      const prefix = await createDriver().readFilePrefix({
        filePath: 'attachments/file.pdf',
        byteCount: 64,
      });

      expect(prefix).toEqual(Buffer.from('prefix'));
      expect(mockFiles[0].name).toBe('attachments/file.pdf');
      expect(mockFiles[0].download).toHaveBeenCalledWith({ start: 0, end: 63 });
    });

    it('should return an empty buffer when the object is empty', async () => {
      mockConfigureFile = (file) => {
        file.download.mockRejectedValue(buildApiError(416));
      };

      await expect(
        createDriver().readFilePrefix({
          filePath: 'attachments/empty',
          byteCount: 64,
        }),
      ).resolves.toEqual(Buffer.alloc(0));
    });

    it('should map a missing object to FILE_NOT_FOUND', async () => {
      mockConfigureFile = (file) => {
        file.download.mockRejectedValue(buildApiError(404));
      };

      await expect(
        createDriver().readFilePrefix({
          filePath: 'attachments/missing',
          byteCount: 64,
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.FILE_NOT_FOUND,
      });
    });
  });

  describe('writeFile', () => {
    it('should store the object under the same key the S3 and local drivers use', async () => {
      await createDriver().writeFile({
        filePath: 'workspace-id/attachment/file.pdf',
        sourceFile: Buffer.from('content'),
        mimeType: 'application/pdf',
      });

      expect(mockFiles[0].name).toBe('workspace-id/attachment/file.pdf');
      expect(mockFiles[0].save).toHaveBeenCalledWith(Buffer.from('content'), {
        contentType: 'application/pdf',
        resumable: false,
      });
    });
  });

  describe('getFileMetadata', () => {
    it('should report the object generation as its checksum', async () => {
      mockConfigureFile = (file) => {
        file.getMetadata.mockResolvedValue([
          { size: '42', generation: '1727712345678901' },
        ]);
      };

      await expect(
        createDriver().getFileMetadata({ filePath: 'attachments/file.pdf' }),
      ).resolves.toEqual({ size: 42, checksum: '1727712345678901' });
    });

    it('should return null when the object does not exist', async () => {
      mockConfigureFile = (file) => {
        file.getMetadata.mockRejectedValue(buildApiError(404));
      };

      await expect(
        createDriver().getFileMetadata({ filePath: 'attachments/missing' }),
      ).resolves.toBeNull();
    });
  });

  describe('move', () => {
    const moveParams = {
      from: { folderPath: 'pending', filename: 'file.png' },
      to: { folderPath: 'final', filename: 'file.png' },
      ifMatchChecksum: '7',
    };

    it('should copy the inspected generation and delete only that generation', async () => {
      await createDriver().move(moveParams);

      const [pinnedSource] = filesNamed('pending/file.png').filter(
        (file) => file.copy.mock.calls.length > 0,
      );

      expect(pinnedSource.options).toEqual({ generation: '7' });
      expect(pinnedSource.copy.mock.calls[0][0].name).toBe('final/file.png');

      const [deletedSource] = filesNamed('pending/file.png').filter(
        (file) => file.delete.mock.calls.length > 0,
      );

      expect(deletedSource.delete).toHaveBeenCalledWith({
        ifGenerationMatch: '7',
        ignoreNotFound: true,
      });
    });

    it('should refuse to promote when the source was overwritten since it was inspected', async () => {
      mockConfigureFile = (file) => {
        file.copy.mockRejectedValue(buildApiError(404));
        file.getMetadata.mockResolvedValue([{ size: '42', generation: '8' }]);
      };

      await expect(createDriver().move(moveParams)).rejects.toMatchObject({
        code: FileStorageExceptionCode.PRECONDITION_FAILED,
      });

      expect(
        mockFiles.every((file) => file.delete.mock.calls.length === 0),
      ).toBe(true);
    });

    it('should report a source that is gone as FILE_NOT_FOUND', async () => {
      mockConfigureFile = (file) => {
        file.copy.mockRejectedValue(buildApiError(404));
        file.getMetadata.mockRejectedValue(buildApiError(404));
      };

      await expect(createDriver().move(moveParams)).rejects.toMatchObject({
        code: FileStorageExceptionCode.FILE_NOT_FOUND,
      });
    });

    it('should keep a source overwritten after the copy and still complete the move', async () => {
      mockConfigureFile = (file) => {
        file.delete.mockRejectedValue(buildApiError(412));
      };

      await expect(createDriver().move(moveParams)).resolves.toBeUndefined();
    });

    it('should not report a storage failure as a precondition failure', async () => {
      mockConfigureFile = (file) => {
        file.copy.mockRejectedValue(buildApiError(503));
      };

      await expect(createDriver().move(moveParams)).rejects.toMatchObject({
        code: 503,
      });
    });

    it('should copy and delete without a precondition when no checksum is given', async () => {
      await createDriver().move({
        from: moveParams.from,
        to: moveParams.to,
      });

      const sources = filesNamed('pending/file.png');

      expect(sources.every((file) => file.options === undefined)).toBe(true);
      expect(
        sources.find((file) => file.delete.mock.calls.length > 0)?.delete,
      ).toHaveBeenCalledWith({ ignoreNotFound: true });
    });

    it('should move every object under a folder prefix', async () => {
      const objects = [
        mockBuildFile('workspace-a/attachment/one.pdf'),
        mockBuildFile('workspace-a/attachment/nested/two.pdf'),
      ];

      mockBucket.getFiles.mockResolvedValue([objects]);

      await createDriver().move({
        from: { folderPath: 'workspace-a' },
        to: { folderPath: 'workspace-b' },
      });

      expect(mockBucket.getFiles).toHaveBeenCalledWith({
        prefix: 'workspace-a/',
      });
      expect(
        mockFiles.flatMap((file) =>
          file.copy.mock.calls.map(([destination]) => destination.name),
        ),
      ).toEqual([
        'workspace-b/attachment/one.pdf',
        'workspace-b/attachment/nested/two.pdf',
      ]);
      objects.forEach((object) =>
        expect(object.delete).toHaveBeenCalledWith({ ignoreNotFound: true }),
      );
    });
  });

  describe('delete', () => {
    it('should delete a single object and ignore one that is already gone', async () => {
      await createDriver().delete({
        folderPath: 'attachments',
        filename: 'file.pdf',
      });

      expect(mockFiles[0].name).toBe('attachments/file.pdf');
      expect(mockFiles[0].delete).toHaveBeenCalledWith({
        ignoreNotFound: true,
      });
    });

    it('should delete a folder by its prefix without touching sibling prefixes', async () => {
      await createDriver().delete({ folderPath: 'workspace-a' });

      expect(mockBucket.deleteFiles).toHaveBeenCalledWith({
        prefix: 'workspace-a/',
      });
    });
  });

  describe('getPresignedUrl', () => {
    it('should return null when presigning is not enabled', async () => {
      await expect(
        createDriver().getPresignedUrl({ filePath: 'some/file.png' }),
      ).resolves.toBeNull();

      expect(mockFiles).toHaveLength(0);
    });

    it('should sign a V4 read URL with the response headers', async () => {
      jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      mockConfigureFile = (file) => {
        file.getSignedUrl.mockResolvedValue(['https://signed.read.url']);
      };

      const url = await createDriver({ presignEnabled: true }).getPresignedUrl({
        filePath: 'some/file.png',
        expiresInSeconds: 3600,
        responseContentType: 'image/png',
        responseContentDisposition: 'inline',
      });

      expect(url).toBe('https://signed.read.url');
      expect(mockFiles[0].getSignedUrl).toHaveBeenCalledWith({
        version: 'v4',
        action: 'read',
        expires: new Date('2026-01-01T01:00:00Z').getTime(),
        responseType: 'image/png',
        responseDisposition: 'inline',
      });
    });
  });

  describe('getPresignedUrl with a Cache-Control', () => {
    const presignParams = {
      filePath: 'some/file.png',
      responseCacheControl: 'private, max-age=86400, immutable',
    };

    it('should sign without rewriting metadata when the object already carries it', async () => {
      mockConfigureFile = (file) => {
        file.getMetadata.mockResolvedValue([
          {
            cacheControl: 'private, max-age=86400, immutable',
            metageneration: '1',
          },
        ]);
        file.getSignedUrl.mockResolvedValue(['https://signed.read.url']);
      };

      await expect(
        createDriver({ presignEnabled: true }).getPresignedUrl(presignParams),
      ).resolves.toBe('https://signed.read.url');

      expect(mockFiles[0].setMetadata).not.toHaveBeenCalled();
    });

    it('should store the Cache-Control on the object, since signed URLs cannot override it', async () => {
      mockConfigureFile = (file) => {
        file.getMetadata.mockResolvedValue([{ metageneration: '3' }]);
        file.getSignedUrl.mockResolvedValue(['https://signed.read.url']);
      };

      await expect(
        createDriver({ presignEnabled: true }).getPresignedUrl(presignParams),
      ).resolves.toBe('https://signed.read.url');

      expect(mockFiles[0].setMetadata).toHaveBeenCalledWith(
        { cacheControl: 'private, max-age=86400, immutable' },
        { ifMetagenerationMatch: '3' },
      );
    });

    it('should fall back to the server when the Cache-Control cannot be stored', async () => {
      mockConfigureFile = (file) => {
        file.getMetadata.mockResolvedValue([{ metageneration: '3' }]);
        file.setMetadata.mockRejectedValue(buildApiError(429));
      };

      await expect(
        createDriver({ presignEnabled: true }).getPresignedUrl(presignParams),
      ).resolves.toBeNull();

      expect(mockFiles[0].getSignedUrl).not.toHaveBeenCalled();
    });
  });

  describe('copy', () => {
    it('should copy a single object to the destination key', async () => {
      await createDriver().copy({
        from: { folderPath: 'source', filename: 'file.pdf' },
        to: { folderPath: 'target', filename: 'file.pdf' },
      });

      expect(mockFiles[0].name).toBe('source/file.pdf');
      expect(mockFiles[0].copy.mock.calls[0][0].name).toBe('target/file.pdf');
    });

    it('should report a missing source as FILE_NOT_FOUND', async () => {
      mockConfigureFile = (file) => {
        file.copy.mockRejectedValue(buildApiError(404));
      };

      await expect(
        createDriver().copy({
          from: { folderPath: 'source', filename: 'missing.pdf' },
          to: { folderPath: 'target', filename: 'missing.pdf' },
        }),
      ).rejects.toMatchObject({
        code: FileStorageExceptionCode.FILE_NOT_FOUND,
      });
    });

    it('should copy a folder without deleting its source', async () => {
      const object = mockBuildFile('workspace-a/attachment/one.pdf');

      mockBucket.getFiles.mockResolvedValue([[object]]);

      await createDriver().copy({
        from: { folderPath: 'workspace-a' },
        to: { folderPath: 'workspace-b' },
      });

      expect(mockFiles[0].copy.mock.calls[0][0].name).toBe(
        'workspace-b/attachment/one.pdf',
      );
      expect(object.delete).not.toHaveBeenCalled();
    });
  });

  describe('checkFolderExists', () => {
    it('should look for a single object under the folder prefix', async () => {
      mockBucket.getFiles.mockResolvedValue([[]]);

      await expect(
        createDriver().checkFolderExists({ folderPath: 'workspace-a' }),
      ).resolves.toBe(false);

      expect(mockBucket.getFiles).toHaveBeenCalledWith({
        prefix: 'workspace-a/',
        maxResults: 1,
        autoPaginate: false,
      });
    });
  });

  describe('getPresignedUploadUrl', () => {
    it('should return null so callers fall back to the server endpoint', async () => {
      await expect(
        createDriver().getPresignedUploadUrl({
          filePath: 'some/file.pdf',
          contentType: 'application/pdf',
          contentLength: 1024,
        }),
      ).resolves.toBeNull();
    });

    it('should sign a V4 write URL with content-type and content-length', async () => {
      jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      mockConfigureFile = (file) => {
        file.getSignedUrl.mockResolvedValue(['https://signed.write.url']);
      };

      const url = await createDriver({
        presignEnabled: true,
      }).getPresignedUploadUrl({
        filePath: 'some/file.pdf',
        contentType: 'application/pdf',
        contentLength: 1024,
      });

      expect(url).toBe('https://signed.write.url');
      expect(mockFiles[0].getSignedUrl).toHaveBeenCalledWith({
        version: 'v4',
        action: 'write',
        expires: new Date('2026-01-01T00:15:00Z').getTime(),
        contentType: 'application/pdf',
        extensionHeaders: { 'content-length': 1024 },
      });
    });
  });
});

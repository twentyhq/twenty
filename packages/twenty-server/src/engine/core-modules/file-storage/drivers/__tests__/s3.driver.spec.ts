import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Readable } from 'stream';

import { isDefined } from 'twenty-shared/utils';

import { FILE_STORAGE_S3_METADATA_MAX_ATTEMPTS } from 'src/engine/core-modules/file-storage/constants/s3-client-timeouts.constant';
import { S3Driver } from 'src/engine/core-modules/file-storage/drivers/s3.driver';
import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

const mockS3Send = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');

  return {
    ...actual,
    S3: jest.fn().mockImplementation(() => ({ send: mockS3Send })),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3Driver.readFile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should request only the specified byte range', async () => {
    mockS3Send.mockResolvedValue({
      Body: Readable.from([Buffer.from('requested bytes')]),
    });

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
    });

    await driver.readFile({
      filePath: 'recordings/video.mp4',
      byteRange: { startByte: 100, endByte: 199 },
    });

    expect(mockS3Send).toHaveBeenCalledTimes(1);

    expect(mockS3Send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: 'test-bucket',
          Key: 'recordings/video.mp4',
          Range: 'bytes=100-199',
        }),
      }),
    );
  });
});

describe('S3Driver.readFilePrefix', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should request only the leading byte range and buffer it', async () => {
    mockS3Send.mockResolvedValue({
      Body: {
        transformToByteArray: jest
          .fn()
          .mockResolvedValue(new Uint8Array(Buffer.from('prefix'))),
      },
    });

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
    });

    const prefix = await driver.readFilePrefix({
      filePath: 'attachments/file.pdf',
      byteCount: 64,
    });

    expect(prefix).toEqual(Buffer.from('prefix'));
    expect(mockS3Send).toHaveBeenCalledTimes(1);
    expect(mockS3Send.mock.calls[0][0]).toBeInstanceOf(GetObjectCommand);
    expect(mockS3Send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: 'test-bucket',
          Key: 'attachments/file.pdf',
          Range: 'bytes=0-63',
        }),
      }),
    );
  });

  it('should return an empty buffer when the object is empty', async () => {
    mockS3Send.mockRejectedValue(
      Object.assign(new Error('The requested range is not satisfiable'), {
        name: 'InvalidRange',
      }),
    );

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
    });

    await expect(
      driver.readFilePrefix({ filePath: 'attachments/empty', byteCount: 64 }),
    ).resolves.toEqual(Buffer.alloc(0));
  });

  it('should map a missing key to FILE_NOT_FOUND', async () => {
    mockS3Send.mockRejectedValue(
      Object.assign(new Error('missing'), { name: 'NoSuchKey' }),
    );

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
    });

    await expect(
      driver.readFilePrefix({ filePath: 'attachments/missing', byteCount: 64 }),
    ).rejects.toMatchObject({ code: FileStorageExceptionCode.FILE_NOT_FOUND });
  });
});

describe('S3Driver.getFileMetadata', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should issue HeadObject through a client with a capped attempt count', async () => {
    mockS3Send.mockResolvedValue({ ContentLength: 42 });

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
    });

    await expect(
      driver.getFileMetadata({ filePath: 'attachments/file.pdf' }),
    ).resolves.toEqual({ size: 42 });

    expect(mockS3Send.mock.calls[0][0]).toBeInstanceOf(HeadObjectCommand);
    expect(S3).toHaveBeenCalledWith(
      expect.objectContaining({
        maxAttempts: FILE_STORAGE_S3_METADATA_MAX_ATTEMPTS,
        responseChecksumValidation: 'WHEN_REQUIRED',
      }),
    );
  });
});

describe('S3Driver.getPresignedUrl', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null when presigning is not enabled', async () => {
    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
      endpoint: 'http://localhost:9000',
    });

    const result = await driver.getPresignedUrl({
      filePath: 'some/file.png',
    });

    expect(result).toBeNull();
    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it('should presign with the main client when enabled without endpoint override', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue(
      'https://s3.us-east-1.amazonaws.com/test-bucket/file.png?X-Amz-Signature=abc',
    );

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
      presignEnabled: true,
    });

    const result = await driver.getPresignedUrl({
      filePath: 'file.png',
      responseContentType: 'image/png',
      responseContentDisposition: 'inline',
      responseCacheControl: 'private, max-age=86400, immutable',
    });

    expect(result).toBe(
      'https://s3.us-east-1.amazonaws.com/test-bucket/file.png?X-Amz-Signature=abc',
    );
    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(GetObjectCommand),
      { expiresIn: 900 },
    );

    const command = (getSignedUrl as jest.Mock).mock.calls[0][1];

    expect(command.input.ResponseCacheControl).toBe(
      'private, max-age=86400, immutable',
    );
  });

  it('should presign with a separate client when endpoint override is provided', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue(
      'https://public.s3.com/test-bucket/some/file.png?X-Amz-Signature=abc',
    );

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
      endpoint: 'http://internal-minio:9000',
      presignEnabled: true,
      presignEndpoint: 'https://public.s3.com',
    });

    const result = await driver.getPresignedUrl({
      filePath: 'some/file.png',
      responseContentType: 'image/png',
      responseContentDisposition: 'inline',
    });

    expect(result).toBe(
      'https://public.s3.com/test-bucket/some/file.png?X-Amz-Signature=abc',
    );
    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(GetObjectCommand),
      { expiresIn: 900 },
    );
  });

  it('should use custom expiry when provided', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('https://signed.url');

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
      presignEnabled: true,
    });

    await driver.getPresignedUrl({
      filePath: 'file.txt',
      expiresInSeconds: 3600,
    });

    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(GetObjectCommand),
      { expiresIn: 3600 },
    );
  });
});

describe('S3Driver.getPresignedUploadUrl', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null when presigning is not enabled', async () => {
    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
    });

    const result = await driver.getPresignedUploadUrl({
      filePath: 'some/file.pdf',
      contentType: 'application/pdf',
      contentLength: 1024,
    });

    expect(result).toBeNull();
    expect(getSignedUrl).not.toHaveBeenCalled();
  });

  it('should presign a PUT with content-type and content-length in the signature', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue(
      'https://s3.us-east-1.amazonaws.com/test-bucket/some/file.pdf?X-Amz-Signature=abc',
    );

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
      presignEnabled: true,
    });

    const result = await driver.getPresignedUploadUrl({
      filePath: 'some/file.pdf',
      contentType: 'application/pdf',
      contentLength: 1024,
      expiresInSeconds: 900,
    });

    expect(result).toBe(
      'https://s3.us-east-1.amazonaws.com/test-bucket/some/file.pdf?X-Amz-Signature=abc',
    );
    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(PutObjectCommand),
      {
        expiresIn: 900,
        signableHeaders: new Set(['content-type', 'content-length']),
      },
    );

    const command = (getSignedUrl as jest.Mock).mock
      .calls[0][1] as PutObjectCommand;

    expect(command.input).toMatchObject({
      Bucket: 'test-bucket',
      Key: 'some/file.pdf',
      ContentType: 'application/pdf',
      ContentLength: 1024,
    });
  });
});

describe('S3Driver.move', () => {
  const notImplementedError = Object.assign(
    new Error('Copy object not implemented with X-Amz-Copy-Source-If-Match'),
    { name: 'NotImplemented', $metadata: { httpStatusCode: 501 } },
  );

  const moveParams = {
    from: { folderPath: 'pending', filename: 'file.png' },
    to: { folderPath: 'final', filename: 'file.png' },
    ifMatchChecksum: '"etag"',
  };

  const getCopyCommands = () =>
    mockS3Send.mock.calls
      .map(([command]) => command)
      .filter((command) => command instanceof CopyObjectCommand);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should copy conditionally on the inspected checksum', async () => {
    mockS3Send.mockResolvedValue({ ETag: '"etag"' });

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
    });

    await driver.move(moveParams);

    const copyCommands = getCopyCommands();

    expect(copyCommands).toHaveLength(1);
    expect(copyCommands[0].input).toMatchObject({
      CopySource: 'test-bucket/pending/file.png',
      CopySourceIfMatch: '"etag"',
      Key: 'final/file.png',
    });
    const lastCommand =
      mockS3Send.mock.calls[mockS3Send.mock.calls.length - 1][0];

    expect(lastCommand).toBeInstanceOf(DeleteObjectCommand);
  });

  it('should fall back to an unconditional copy when the backend does not implement CopySourceIfMatch', async () => {
    mockS3Send.mockImplementation(async (command) => {
      if (
        command instanceof CopyObjectCommand &&
        isDefined(command.input.CopySourceIfMatch)
      ) {
        throw notImplementedError;
      }

      return { ETag: '"etag"' };
    });

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
    });

    await driver.move(moveParams);
    await driver.move(moveParams);

    const copyCommands = getCopyCommands();

    expect(copyCommands).toHaveLength(3);
    expect(copyCommands[0].input.CopySourceIfMatch).toBe('"etag"');
    expect(copyCommands[1].input.CopySourceIfMatch).toBeUndefined();
    expect(copyCommands[2].input.CopySourceIfMatch).toBeUndefined();
  });

  it('should still report a failed precondition', async () => {
    mockS3Send.mockImplementation(async (command) => {
      if (command instanceof CopyObjectCommand) {
        throw Object.assign(new Error('Precondition failed'), {
          name: 'PreconditionFailed',
        });
      }

      return { ETag: '"etag"' };
    });

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
    });

    await expect(driver.move(moveParams)).rejects.toMatchObject({
      code: FileStorageExceptionCode.PRECONDITION_FAILED,
    });
    expect(getCopyCommands()).toHaveLength(1);
  });

  it('should refuse to copy when the source changed since it was inspected', async () => {
    mockS3Send.mockResolvedValue({ ETag: '"replaced"' });

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
    });

    await expect(driver.move(moveParams)).rejects.toMatchObject({
      code: FileStorageExceptionCode.PRECONDITION_FAILED,
    });
    expect(getCopyCommands()).toHaveLength(0);
  });
});

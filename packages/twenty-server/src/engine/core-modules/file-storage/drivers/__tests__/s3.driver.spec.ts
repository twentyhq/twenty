import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { S3Driver } from 'src/engine/core-modules/file-storage/drivers/s3.driver';

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');

  return {
    ...actual,
    S3: jest.fn().mockImplementation(() => ({})),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3Driver.getPresignedUrl', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null when presignEndpoint is not configured', async () => {
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

  it('should return a signed URL when presignEndpoint is configured', async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue(
      'https://public.s3.com/test-bucket/some/file.png?X-Amz-Signature=abc',
    );

    const driver = new S3Driver({
      bucketName: 'test-bucket',
      region: 'us-east-1',
      endpoint: 'http://internal-minio:9000',
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
      presignEndpoint: 'https://public.s3.com',
    });

    await driver.getPresignedUrl({
      filePath: 'file.txt',
      expiresInSeconds: 3600,
    });

    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(GetObjectCommand),
      {
        expiresIn: 3600,
      },
    );
  });
});

import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateAppTarballUpload = vi.fn();
const mockCompleteAppTarballUpload = vi.fn();
const mockUploadAppTarball = vi.fn();
const mockPutFileToUploadUrl = vi.fn();

vi.mock('@/cli/utilities/api/api-service', () => ({
  ApiService: class {
    createAppTarballUpload = mockCreateAppTarballUpload;
    completeAppTarballUpload = mockCompleteAppTarballUpload;
    uploadAppTarball = mockUploadAppTarball;
  },
}));

vi.mock('@/cli/utilities/file/put-file-to-upload-url', () => ({
  putFileToUploadUrl: (...args: unknown[]) => mockPutFileToUploadUrl(...args),
}));

const { appDeploy } = await import('@/cli/operations/deploy');

const TARBALL_CONTENT = 'tarball bytes';

const uploadTarget = {
  fileId: 'file-id',
  uploadUrl: 'https://storage.tld/pending/file-id',
  contentType: 'application/octet-stream',
  expiresAt: '2026-01-01T00:00:00.000Z',
};

const registration = {
  id: 'registration-id',
  universalIdentifier: 'application-uid',
  name: 'Test App',
};

describe('appDeploy', () => {
  let tarballPath: string;

  beforeEach(async () => {
    vi.clearAllMocks();

    const directory = await mkdtemp(join(tmpdir(), 'twenty-deploy-'));

    tarballPath = join(directory, 'app.tar.gz');
    await writeFile(tarballPath, TARBALL_CONTENT);

    mockCreateAppTarballUpload.mockResolvedValue({
      success: true,
      data: uploadTarget,
    });
    mockCompleteAppTarballUpload.mockResolvedValue({
      success: true,
      data: registration,
    });
    mockUploadAppTarball.mockResolvedValue({
      success: true,
      data: registration,
    });
    mockPutFileToUploadUrl.mockResolvedValue(undefined);
  });

  it('sends the tarball straight to storage, then registers it', async () => {
    const progressMessages: string[] = [];

    const result = await appDeploy({
      tarballPath,
      onProgress: (message) => progressMessages.push(message),
    });

    expect(result).toEqual({ success: true, data: registration });

    expect(mockCreateAppTarballUpload).toHaveBeenCalledWith({
      size: TARBALL_CONTENT.length,
    });
    expect(mockPutFileToUploadUrl).toHaveBeenCalledWith({
      absolutePath: tarballPath,
      uploadUrl: uploadTarget.uploadUrl,
      contentType: uploadTarget.contentType,
    });
    expect(mockCompleteAppTarballUpload).toHaveBeenCalledWith({
      fileId: uploadTarget.fileId,
    });
    expect(mockUploadAppTarball).not.toHaveBeenCalled();
    expect(progressMessages).toEqual([
      `Uploading ${tarballPath}...`,
      'Registering application...',
    ]);
  });

  it('falls back to the multipart upload when the server has no direct upload', async () => {
    mockCreateAppTarballUpload.mockResolvedValue({
      success: false,
      error: 'Cannot query field "createAppTarballUpload" on type "Mutation".',
    });

    const result = await appDeploy({ tarballPath });

    expect(result).toEqual({ success: true, data: registration });
    expect(mockUploadAppTarball).toHaveBeenCalledTimes(1);
    expect(mockUploadAppTarball.mock.calls[0][0].tarballBuffer.toString()).toBe(
      TARBALL_CONTENT,
    );
    expect(mockPutFileToUploadUrl).not.toHaveBeenCalled();
    expect(mockCompleteAppTarballUpload).not.toHaveBeenCalled();
  });

  it('reports a refused upload target without sending anything', async () => {
    mockCreateAppTarballUpload.mockResolvedValue({
      success: false,
      error: 'Invalid tarball size 0 (max 104857600 bytes)',
    });

    const result = await appDeploy({ tarballPath });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'DEPLOY_FAILED',
        message: 'Upload failed: Invalid tarball size 0 (max 104857600 bytes)',
      },
    });
    expect(mockPutFileToUploadUrl).not.toHaveBeenCalled();
    expect(mockUploadAppTarball).not.toHaveBeenCalled();
  });

  it('does not register the tarball when storage refuses the bytes', async () => {
    mockPutFileToUploadUrl.mockRejectedValue(
      new Error('Request failed with status code 403'),
    );

    const result = await appDeploy({ tarballPath });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'DEPLOY_FAILED',
        message: 'Upload failed: Request failed with status code 403',
      },
    });
    expect(mockCompleteAppTarballUpload).not.toHaveBeenCalled();
  });

  it('reports a rejected tarball from the completion step', async () => {
    mockCompleteAppTarballUpload.mockResolvedValue({
      success: false,
      error: 'manifest.json not found or invalid in tarball',
    });

    const result = await appDeploy({ tarballPath });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'DEPLOY_FAILED',
        message: 'Upload failed: manifest.json not found or invalid in tarball',
      },
    });
  });
});

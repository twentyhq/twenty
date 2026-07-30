import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { OUTPUT_DIR } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateApplicationFileUploads = vi.fn();
const mockCompleteApplicationFileUploads = vi.fn();
const mockPutFileToUploadUrl = vi.fn();

vi.mock('@/cli/utilities/api/api-service', () => ({
  ApiService: class {
    createApplicationFileUploads = mockCreateApplicationFileUploads;
    completeApplicationFileUploads = mockCompleteApplicationFileUploads;
  },
}));

vi.mock('@/cli/utilities/file/put-file-to-upload-url', () => ({
  putFileToUploadUrl: (...args: unknown[]) => mockPutFileToUploadUrl(...args),
}));

const { FileUploader } = await import('@/cli/utilities/file/file-uploader');

const buildUploadTargets = (builtPaths: string[]) =>
  builtPaths.map((builtPath, index) => ({
    fileId: `file-id-${index}`,
    filePath: builtPath,
    uploadUrl: `https://storage.tld/${index}`,
    contentType: 'application/octet-stream',
    expiresAt: '2026-01-01T00:00:00.000Z',
  }));

describe('FileUploader.uploadFiles', () => {
  let appPath: string;

  const builtFiles = ['handler.mjs', 'component.js'];

  const filesToUpload = builtFiles.map((name) => ({
    builtPath: join(OUTPUT_DIR, name),
    fileFolder: FileFolder.BuiltLogicFunction,
  }));

  const buildUploader = () =>
    new FileUploader({
      appPath,
      applicationUniversalIdentifier: 'application-uid',
    });

  beforeEach(async () => {
    vi.clearAllMocks();

    appPath = await mkdtemp(join(tmpdir(), 'twenty-file-uploader-'));
    await mkdir(join(appPath, OUTPUT_DIR), { recursive: true });

    for (const name of builtFiles) {
      await writeFile(join(appPath, OUTPUT_DIR, name), `content of ${name}`);
    }

    mockCreateApplicationFileUploads.mockResolvedValue({
      success: true,
      data: { targets: buildUploadTargets(builtFiles), errors: [] },
    });
    mockCompleteApplicationFileUploads.mockResolvedValue({
      success: true,
      data: { files: [], errors: [] },
    });
    mockPutFileToUploadUrl.mockResolvedValue(undefined);
  });

  it('should reserve, upload and confirm a batch in two api calls', async () => {
    const failures = await buildUploader().uploadFiles(filesToUpload);

    expect(failures).toEqual([]);
    expect(mockCreateApplicationFileUploads).toHaveBeenCalledTimes(1);
    expect(mockCompleteApplicationFileUploads).toHaveBeenCalledTimes(1);
    expect(mockPutFileToUploadUrl).toHaveBeenCalledTimes(2);
  });

  it('should declare paths relative to the output directory with their real size', async () => {
    await buildUploader().uploadFiles(filesToUpload);

    expect(mockCreateApplicationFileUploads).toHaveBeenCalledWith({
      applicationUniversalIdentifier: 'application-uid',
      files: [
        {
          fileFolder: FileFolder.BuiltLogicFunction,
          filePath: 'handler.mjs',
          size: 'content of handler.mjs'.length,
        },
        {
          fileFolder: FileFolder.BuiltLogicFunction,
          filePath: 'component.js',
          size: 'content of component.js'.length,
        },
      ],
    });
  });

  it('should report the failing file and confirm the rest when one upload fails', async () => {
    mockPutFileToUploadUrl.mockRejectedValueOnce(new Error('storage refused'));

    const failures = await buildUploader().uploadFiles(filesToUpload);

    expect(failures).toEqual([
      {
        builtPath: join(OUTPUT_DIR, 'handler.mjs'),
        error: expect.stringContaining('storage refused'),
      },
    ]);
    expect(mockCompleteApplicationFileUploads).toHaveBeenCalledWith({
      applicationUniversalIdentifier: 'application-uid',
      fileIds: ['file-id-1'],
    });
  });

  it('should fail the whole batch when no upload url could be reserved', async () => {
    mockCreateApplicationFileUploads.mockResolvedValue({
      success: false,
      error: 'Limit reached',
    });

    const failures = await buildUploader().uploadFiles(filesToUpload);

    expect(failures).toHaveLength(2);
    expect(failures[0].error).toContain('Limit reached');
    expect(mockPutFileToUploadUrl).not.toHaveBeenCalled();
    expect(mockCompleteApplicationFileUploads).not.toHaveBeenCalled();
  });

  it('should fail every uploaded file when the batch cannot be confirmed', async () => {
    mockCompleteApplicationFileUploads.mockResolvedValue({
      success: false,
      error: 'confirmation failed',
    });

    const failures = await buildUploader().uploadFiles(filesToUpload);

    expect(failures).toHaveLength(2);
    expect(
      failures.every((failure) =>
        failure.error.includes('confirmation failed'),
      ),
    ).toBe(true);
  });

  it('should map per-file reservation errors back to their built path (fail-slow)', async () => {
    mockCreateApplicationFileUploads.mockResolvedValue({
      success: true,
      data: {
        targets: buildUploadTargets(['component.js']).map((target) => ({
          ...target,
          filePath: 'component.js',
        })),
        errors: [
          {
            fileFolder: 'BuiltLogicFunction',
            filePath: 'handler.mjs',
            message: 'reservation refused',
          },
        ],
      },
    });

    const failures = await buildUploader().uploadFiles(filesToUpload);

    expect(failures).toEqual([
      {
        builtPath: join(OUTPUT_DIR, 'handler.mjs'),
        error: 'reservation refused',
      },
    ]);
    // Only the reserved file is uploaded and confirmed.
    expect(mockPutFileToUploadUrl).toHaveBeenCalledTimes(1);
    expect(mockCompleteApplicationFileUploads).toHaveBeenCalledWith({
      applicationUniversalIdentifier: 'application-uid',
      fileIds: ['file-id-0'],
    });
  });

  it('should map per-file completion errors back to their built path (fail-slow)', async () => {
    mockCompleteApplicationFileUploads.mockResolvedValue({
      success: true,
      data: {
        files: [{ id: 'file-id-0', path: 'built-logic-function/handler.mjs' }],
        errors: [{ fileId: 'file-id-1', message: 'size mismatch' }],
      },
    });

    const failures = await buildUploader().uploadFiles(filesToUpload);

    expect(failures).toEqual([
      {
        builtPath: join(OUTPUT_DIR, 'component.js'),
        error: 'size mismatch',
      },
    ]);
  });

  it('should not call the api at all when there is nothing to upload', async () => {
    const failures = await buildUploader().uploadFiles([]);

    expect(failures).toEqual([]);
    expect(mockCreateApplicationFileUploads).not.toHaveBeenCalled();
  });
});

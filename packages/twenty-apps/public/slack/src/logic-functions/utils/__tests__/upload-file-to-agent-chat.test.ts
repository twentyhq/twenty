import { type MetadataApiClient } from 'twenty-client-sdk/metadata';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { uploadFileToAgentChat } from 'src/logic-functions/utils/upload-file-to-agent-chat';

const mutation = vi.fn();

const metadataClient = {
  mutation,
} as unknown as InstanceType<typeof MetadataApiClient>;

const UPLOAD_TARGET = {
  fileId: 'pending-file-id',
  uploadUrl: 'https://storage.twenty.com/pending-file-id',
  contentType: 'application/octet-stream',
};

const uploadPngFile = async () =>
  await uploadFileToAgentChat({
    metadataClient,
    fileName: 'screenshot.png',
    bytes: new Uint8Array([137, 80, 78, 71]),
    timeoutMs: 30_000,
  });

describe('uploadFileToAgentChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutation
      .mockResolvedValueOnce({ createFileUpload: UPLOAD_TARGET })
      .mockResolvedValueOnce({
        completeFileUpload: { id: 'uploaded-file-id' },
      });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return the file id the completed upload carries', async () => {
    expect(await uploadPngFile()).toBe('uploaded-file-id');
  });

  it('should declare the byte length so the server can size the upload', async () => {
    await uploadPngFile();

    expect(mutation).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        createFileUpload: expect.objectContaining({
          __args: {
            filename: 'screenshot.png',
            size: 4,
            fileFolder: 'AgentChat',
          },
        }),
      }),
    );
  });

  it('should put the bytes on the url the server handed back', async () => {
    await uploadPngFile();

    expect(fetch).toHaveBeenCalledWith(
      UPLOAD_TARGET.uploadUrl,
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('should throw when the upload target is missing', async () => {
    mutation.mockReset().mockResolvedValueOnce({});

    await expect(uploadPngFile()).rejects.toThrow(
      'createFileUpload did not return an upload target',
    );
  });

  it('should throw when the storage put fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );

    await expect(uploadPngFile()).rejects.toThrow(
      'upload failed with status 500',
    );
  });

  it('should throw when the completed upload carries no file id', async () => {
    mutation
      .mockReset()
      .mockResolvedValueOnce({ createFileUpload: UPLOAD_TARGET })
      .mockResolvedValueOnce({});

    await expect(uploadPngFile()).rejects.toThrow(
      'completeFileUpload did not return a file id',
    );
  });
});

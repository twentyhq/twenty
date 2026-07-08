import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { putMediaDownloadBodyToUploadTarget } from 'src/logic-functions/flows/put-media-download-body-to-upload-target.util';

const UPLOAD_URL = 'https://storage.example.com/video.mp4';

const buildMediaDownloadBody = ({
  chunks = [new Uint8Array([1, 2, 3]), new Uint8Array([4])],
  cancel,
  close = true,
}: {
  chunks?: Uint8Array[];
  cancel?: () => void | Promise<void>;
  close?: boolean;
} = {}): ReadableStream<Uint8Array> =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }

      if (close) {
        controller.close();
      }
    },
    cancel,
  });

const readStreamBytes = async (
  stream: ReadableStream<Uint8Array>,
): Promise<number[]> => {
  const reader = stream.getReader();
  const bytes: number[] = [];

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      return bytes;
    }

    bytes.push(...value);
  }
};

describe('putMediaDownloadBodyToUploadTarget', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('puts the media download body to the upload target with declared upload headers', async () => {
    fetchMock.mockImplementation(async (_url, init) => {
      const requestInit = init as {
        body: ReadableStream<Uint8Array>;
        duplex?: string;
        headers: Record<string, string>;
        method?: string;
      };

      expect(requestInit.method).toBe('PUT');
      expect(requestInit.duplex).toBe('half');
      expect(requestInit.headers['Content-Length']).toBe('4');
      expect(requestInit.headers['Content-Type']).toBe(
        'application/octet-stream',
      );
      expect(await readStreamBytes(requestInit.body)).toEqual([1, 2, 3, 4]);

      return { ok: true, status: 200 };
    });

    await putMediaDownloadBodyToUploadTarget({
      callRecordingId: 'call-recording-1',
      fileName: 'video.mp4',
      mediaDownloadBody: buildMediaDownloadBody(),
      sizeBytes: 4,
      uploadTarget: {
        uploadUrl: UPLOAD_URL,
        contentType: 'application/octet-stream',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      UPLOAD_URL,
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('cancels the failed upload response body and media download body when storage returns non-ok', async () => {
    const mediaDownloadBodyCancelMock = vi.fn().mockResolvedValue(undefined);
    const uploadResponseBodyCancelMock = vi.fn().mockResolvedValue(undefined);

    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      body: new ReadableStream<Uint8Array>({
        cancel: uploadResponseBodyCancelMock,
      }),
    });

    await expect(
      putMediaDownloadBodyToUploadTarget({
        callRecordingId: 'call-recording-1',
        fileName: 'video.mp4',
        mediaDownloadBody: buildMediaDownloadBody({
          cancel: mediaDownloadBodyCancelMock,
          close: false,
        }),
        sizeBytes: 4,
        uploadTarget: {
          uploadUrl: UPLOAD_URL,
          contentType: 'application/octet-stream',
        },
      }),
    ).rejects.toThrow('upload failed with status 500');

    expect(uploadResponseBodyCancelMock).toHaveBeenCalledTimes(1);
    expect(mediaDownloadBodyCancelMock).toHaveBeenCalledTimes(1);
  });

  it('cancels the media download body when the upload request rejects', async () => {
    const mediaDownloadBodyCancelMock = vi.fn().mockResolvedValue(undefined);

    fetchMock.mockRejectedValue(new Error('upload socket closed'));

    await expect(
      putMediaDownloadBodyToUploadTarget({
        callRecordingId: 'call-recording-1',
        fileName: 'video.mp4',
        mediaDownloadBody: buildMediaDownloadBody({
          cancel: mediaDownloadBodyCancelMock,
          close: false,
        }),
        sizeBytes: 4,
        uploadTarget: {
          uploadUrl: UPLOAD_URL,
          contentType: 'application/octet-stream',
        },
      }),
    ).rejects.toThrow('upload socket closed');

    expect(mediaDownloadBodyCancelMock).toHaveBeenCalledTimes(1);
  });
});

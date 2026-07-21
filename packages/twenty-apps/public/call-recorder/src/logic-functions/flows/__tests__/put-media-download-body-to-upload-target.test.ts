import { type ClientRequest, type IncomingMessage } from 'node:http';
import { PassThrough, Readable } from 'node:stream';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const requestOverHttpMock = vi.hoisted(() => vi.fn());
const requestOverHttpsMock = vi.hoisted(() => vi.fn());

vi.mock('node:http', async () => {
  const actualHttp = await vi.importActual<typeof import('node:http')>(
    'node:http',
  );

  return { ...actualHttp, request: requestOverHttpMock };
});

vi.mock('node:https', async () => {
  const actualHttps = await vi.importActual<typeof import('node:https')>(
    'node:https',
  );

  return { ...actualHttps, request: requestOverHttpsMock };
});

import { putMediaDownloadBodyToUploadTarget } from 'src/logic-functions/flows/put-media-download-body-to-upload-target.util';

const HTTPS_UPLOAD_URL = 'https://storage.example.com/video.mp4';
const HTTP_UPLOAD_URL = 'http://storage.example.com/video.mp4';

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

const buildUploadResponse = ({
  statusCode = 200,
  chunks = [],
}: {
  statusCode?: number;
  chunks?: Buffer[];
} = {}): IncomingMessage => {
  const uploadResponse = Readable.from(chunks) as IncomingMessage;

  uploadResponse.statusCode = statusCode;

  return uploadResponse;
};

const buildUploadRequest = ({
  response,
  emitResponseOnFinish = true,
}: {
  response?: IncomingMessage;
  emitResponseOnFinish?: boolean;
} = {}) => {
  const uploadRequest = new PassThrough();
  const uploadedBytes: number[] = [];

  uploadRequest.on('data', (chunk: Buffer) => {
    uploadedBytes.push(...chunk);
  });

  if (response !== undefined) {
    if (emitResponseOnFinish) {
      uploadRequest.on('finish', () => {
        uploadRequest.emit('response', response);
      });
    } else {
      queueMicrotask(() => {
        uploadRequest.emit('response', response);
      });
    }
  }

  return {
    uploadedBytes,
    uploadRequest: uploadRequest as unknown as ClientRequest,
  };
};

const putDefaultMediaDownloadBodyToUploadTarget = ({
  mediaDownloadBody = buildMediaDownloadBody(),
  uploadUrl = HTTPS_UPLOAD_URL,
}: {
  mediaDownloadBody?: ReadableStream<Uint8Array>;
  uploadUrl?: string;
} = {}) =>
  putMediaDownloadBodyToUploadTarget({
    fileName: 'video.mp4',
    mediaDownloadBody,
    sizeBytes: 4,
    uploadTarget: {
      uploadUrl,
      contentType: 'application/octet-stream',
    },
  });

describe('putMediaDownloadBodyToUploadTarget', () => {
  beforeEach(() => {
    requestOverHttpMock.mockReset();
    requestOverHttpsMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('streams the media download body to the upload target with declared headers', async () => {
    const { uploadRequest, uploadedBytes } = buildUploadRequest({
      response: buildUploadResponse(),
    });

    requestOverHttpsMock.mockReturnValue(uploadRequest);

    await putDefaultMediaDownloadBodyToUploadTarget();

    const [uploadUrl, uploadRequestOptions] = requestOverHttpsMock.mock.calls[0];

    expect(uploadUrl.href).toBe(HTTPS_UPLOAD_URL);
    expect(uploadRequestOptions).toMatchObject({
      method: 'PUT',
      headers: {
        'Content-Length': 4,
        'Content-Type': 'application/octet-stream',
      },
    });
    expect(uploadRequestOptions.signal).toBeInstanceOf(AbortSignal);
    expect(uploadedBytes).toEqual([1, 2, 3, 4]);
  });

  it('uses the http client for http upload targets', async () => {
    const { uploadRequest } = buildUploadRequest({
      response: buildUploadResponse(),
    });

    requestOverHttpMock.mockReturnValue(uploadRequest);

    await putDefaultMediaDownloadBodyToUploadTarget({
      uploadUrl: HTTP_UPLOAD_URL,
    });

    expect(requestOverHttpMock).toHaveBeenCalledTimes(1);
    expect(requestOverHttpsMock).not.toHaveBeenCalled();
  });

  it('destroys the media download readable when storage returns a failed status', async () => {
    const mediaDownloadBodyCancelMock = vi.fn().mockResolvedValue(undefined);
    const uploadResponse = buildUploadResponse({
      statusCode: 500,
      chunks: [Buffer.from('storage failed')],
    });
    const { uploadRequest } = buildUploadRequest({
      emitResponseOnFinish: false,
      response: uploadResponse,
    });

    requestOverHttpsMock.mockReturnValue(uploadRequest);

    await expect(
      putDefaultMediaDownloadBodyToUploadTarget({
        mediaDownloadBody: buildMediaDownloadBody({
          cancel: mediaDownloadBodyCancelMock,
          close: false,
        }),
      }),
    ).rejects.toThrow('upload of video.mp4 failed with status 500');

    expect(mediaDownloadBodyCancelMock).toHaveBeenCalledTimes(1);
    expect(uploadResponse.readableEnded).toBe(true);
  });

  it('destroys the media download readable when the upload request fails', async () => {
    const mediaDownloadBodyCancelMock = vi.fn().mockResolvedValue(undefined);
    const { uploadRequest } = buildUploadRequest();

    requestOverHttpsMock.mockReturnValue(uploadRequest);

    queueMicrotask(() => {
      uploadRequest.emit('error', new Error('upload socket closed'));
    });

    await expect(
      putDefaultMediaDownloadBodyToUploadTarget({
        mediaDownloadBody: buildMediaDownloadBody({
          cancel: mediaDownloadBodyCancelMock,
          close: false,
        }),
      }),
    ).rejects.toThrow('upload socket closed');

    expect(mediaDownloadBodyCancelMock).toHaveBeenCalledTimes(1);
  });
});

type MediaUploadTarget = {
  uploadUrl: string;
  contentType: string;
};

type MediaDownloadBodyUploadRequest = {
  uploadRequestBody: ReadableStream<Uint8Array>;
  cancelMediaDownloadBodyReader: () => Promise<void>;
};

// duplex is required by fetch when the body is a stream but is missing from the DOM lib's RequestInit
type StreamingRequestInit = RequestInit & { duplex: 'half' };

const MEDIA_UPLOAD_TIMEOUT_MS = 120_000;

export const putMediaDownloadBodyToUploadTarget = async ({
  callRecordingId,
  fileName,
  mediaDownloadBody,
  sizeBytes,
  uploadTarget,
}: {
  callRecordingId: string;
  fileName: string;
  mediaDownloadBody: ReadableStream<Uint8Array>;
  sizeBytes: number;
  uploadTarget: MediaUploadTarget;
}): Promise<void> => {
  const { uploadRequestBody, cancelMediaDownloadBodyReader } =
    createUploadRequestBodyFromMediaDownloadBody({
      callRecordingId,
      fileName,
      mediaDownloadBody,
    });
  const uploadRequestInit: StreamingRequestInit = {
    method: 'PUT',
    body: uploadRequestBody,
    duplex: 'half',
    headers: {
      'Content-Type': uploadTarget.contentType,
      'Content-Length': String(sizeBytes),
    },
    signal: AbortSignal.timeout(MEDIA_UPLOAD_TIMEOUT_MS),
  };

  const uploadResponse = await fetch(
    uploadTarget.uploadUrl,
    uploadRequestInit,
  ).catch(async (error) => {
    await cancelMediaDownloadBodyReader();

    throw error;
  });

  if (!uploadResponse.ok) {
    await cancelFailedUploadResponseBody({
      callRecordingId,
      fileName,
      uploadResponse,
    });
    await cancelMediaDownloadBodyReader();

    throw new Error(`upload failed with status ${uploadResponse.status}`);
  }
};

const createUploadRequestBodyFromMediaDownloadBody = ({
  callRecordingId,
  fileName,
  mediaDownloadBody,
}: {
  callRecordingId: string;
  fileName: string;
  mediaDownloadBody: ReadableStream<Uint8Array>;
}): MediaDownloadBodyUploadRequest => {
  const mediaDownloadBodyReader = mediaDownloadBody.getReader();
  let isMediaDownloadBodyReaderClosed = false;

  const cancelMediaDownloadBodyReader = async () => {
    if (isMediaDownloadBodyReaderClosed) {
      return;
    }

    isMediaDownloadBodyReaderClosed = true;

    await mediaDownloadBodyReader.cancel().catch((error) => {
      console.warn(
        `[call-recorder] media-ingestion phase=media-download-body-reader-cancel-failed callRecordingId=${callRecordingId} fileName=${fileName}: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  };

  const uploadRequestBody = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await mediaDownloadBodyReader.read();

      if (done) {
        isMediaDownloadBodyReaderClosed = true;
        mediaDownloadBodyReader.releaseLock();
        controller.close();

        return;
      }

      controller.enqueue(value);
    },
    async cancel() {
      await cancelMediaDownloadBodyReader();
    },
  });

  return { uploadRequestBody, cancelMediaDownloadBodyReader };
};

const cancelFailedUploadResponseBody = async ({
  callRecordingId,
  fileName,
  uploadResponse,
}: {
  callRecordingId: string;
  fileName: string;
  uploadResponse: Response;
}) => {
  await uploadResponse.body?.cancel().catch((error) => {
    console.warn(
      `[call-recorder] media-ingestion phase=upload-response-body-cancel-failed callRecordingId=${callRecordingId} fileName=${fileName}: ${error instanceof Error ? error.message : String(error)}`,
    );
  });
};

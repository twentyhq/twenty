import { MESSENGER_ATTACHMENT_DOWNLOAD_TIMEOUT_MS } from 'src/constants/messenger-attachment-download-timeout-ms.constant';
import { MESSENGER_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/messenger-attachment-max-size-bytes.constant';

// returns undefined for a file over the size limit, read in chunks so it never sits whole in memory
export const downloadIncomingAttachment = async (
  url: string,
): Promise<Uint8Array | undefined> => {
  const maxSizeBytes = MESSENGER_ATTACHMENT_MAX_SIZE_BYTES.other;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(MESSENGER_ATTACHMENT_DOWNLOAD_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `Downloading a Messenger attachment failed (${response.status})`,
    );
  }

  if (Number(response.headers.get('content-length')) > maxSizeBytes) {
    await response.body?.cancel();

    return undefined;
  }

  const chunks: Uint8Array[] = [];
  let sizeBytes = 0;

  for await (const chunk of response.body ?? []) {
    sizeBytes += chunk.byteLength;

    if (sizeBytes > maxSizeBytes) {
      return undefined;
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

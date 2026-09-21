import { isNull } from '@sniptt/guards';

import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const cancelFathomMediaDownloadBody = async ({
  body,
  callRecordingId,
  fileName,
}: {
  body: ReadableStream<Uint8Array> | null;
  callRecordingId: string;
  fileName: string;
}): Promise<void> => {
  if (isNull(body)) {
    return;
  }

  await body.cancel().catch((error: unknown) => {
    console.warn(
      `[fathom] media download body cancellation failed callRecordingId=${callRecordingId} fileName=${fileName}: ${toErrorMessage(error)}`,
    );
  });
};

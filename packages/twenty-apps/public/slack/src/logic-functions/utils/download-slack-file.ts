import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_ASSISTANT_ATTACHMENT_DOWNLOAD_TIMEOUT_MS } from 'src/logic-functions/constants/slack-assistant-attachment-download-timeout-ms';
import { SLACK_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES } from 'src/logic-functions/constants/slack-assistant-max-attachment-size-bytes';

type DownloadSlackFileResult =
  | { success: true; bytes: Uint8Array<ArrayBuffer>; contentType: string }
  | { success: false; error: string };

export const downloadSlackFile = async ({
  urlPrivate,
  mimeType,
  botToken,
}: {
  urlPrivate: string;
  mimeType: string;
  botToken: string;
}): Promise<DownloadSlackFileResult> => {
  let response: Response;

  try {
    response = await fetch(urlPrivate, {
      headers: { Authorization: `Bearer ${botToken}` },
      signal: AbortSignal.timeout(
        SLACK_ASSISTANT_ATTACHMENT_DOWNLOAD_TIMEOUT_MS,
      ),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  if (!response.ok) {
    return { success: false, error: `status ${response.status}` };
  }

  // Slack answers a token missing files:read with the HTML sign-in page under a
  // 200, so the content type is the only signal that the bytes are the file
  const responseContentType = response.headers.get('content-type') ?? '';

  if (!responseContentType.startsWith(mimeType)) {
    return {
      success: false,
      error: `expected ${mimeType} but Slack returned ${isNonEmptyString(responseContentType) ? responseContentType : 'no content type'}, which usually means the bot token predates the files:read scope`,
    };
  }

  const bytes = new Uint8Array(await response.arrayBuffer());

  if (bytes.byteLength > SLACK_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES) {
    return {
      success: false,
      error: `file is ${bytes.byteLength} bytes, over the ${SLACK_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES} byte limit`,
    };
  }

  return { success: true, bytes, contentType: mimeType };
};

import { isNonEmptyString, isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES } from 'src/logic-functions/constants/slack-assistant-max-attachment-size-bytes';

type DownloadSlackFileResult =
  | { success: true; bytes: Uint8Array<ArrayBuffer>; contentType: string }
  | {
      success: false;
      error: string;
      reason: 'missing-scope' | 'download-failed';
    };

const TOO_LARGE_ERROR = `file is over the ${SLACK_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES} byte limit`;

const AUTH_REFUSAL_STATUSES = new Set([401, 403]);

const SIGN_IN_PAGE_CONTENT_TYPE = 'text/html';

const FILES_READ_SCOPE_MISSING_HINT =
  'which usually means the bot token predates the files:read scope';

const parseContentLengthBytes = (
  headerValue: string | null,
): number | undefined => {
  if (!isNonEmptyString(headerValue)) {
    return undefined;
  }

  const parsedBytes = Number(headerValue.trim());

  return Number.isFinite(parsedBytes) && parsedBytes >= 0
    ? parsedBytes
    : undefined;
};

const readBoundedBody = async (
  body: ReadableStream<Uint8Array>,
): Promise<Uint8Array<ArrayBuffer> | undefined> => {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      totalBytes += value.byteLength;

      if (totalBytes > SLACK_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES) {
        await reader.cancel().catch(() => undefined);

        return undefined;
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return bytes;
};

export const downloadSlackFile = async ({
  urlPrivate,
  mimeType,
  botToken,
  timeoutMs,
}: {
  urlPrivate: string;
  mimeType: string;
  botToken: string;
  timeoutMs: number;
}): Promise<DownloadSlackFileResult> => {
  let response: Response;

  try {
    response = await fetch(urlPrivate, {
      headers: { Authorization: `Bearer ${botToken}` },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      reason: 'download-failed',
    };
  }

  if (!response.ok) {
    if (AUTH_REFUSAL_STATUSES.has(response.status)) {
      return {
        success: false,
        error: `Slack refused the download with status ${response.status}, ${FILES_READ_SCOPE_MISSING_HINT}`,
        reason: 'missing-scope',
      };
    }

    return {
      success: false,
      error: `status ${response.status}`,
      reason: 'download-failed',
    };
  }

  const responseContentType = response.headers.get('content-type') ?? '';

  if (!responseContentType.startsWith(mimeType)) {
    if (responseContentType.startsWith(SIGN_IN_PAGE_CONTENT_TYPE)) {
      return {
        success: false,
        error: `Slack returned its sign-in page instead of ${mimeType}, ${FILES_READ_SCOPE_MISSING_HINT}`,
        reason: 'missing-scope',
      };
    }

    return {
      success: false,
      error: `expected ${mimeType} but Slack returned ${isNonEmptyString(responseContentType) ? responseContentType : 'no content type'}`,
      reason: 'download-failed',
    };
  }

  const contentLengthBytes = parseContentLengthBytes(
    response.headers.get('content-length'),
  );

  if (
    isDefined(contentLengthBytes) &&
    contentLengthBytes > SLACK_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES
  ) {
    await response.body?.cancel().catch(() => undefined);

    return { success: false, error: TOO_LARGE_ERROR, reason: 'download-failed' };
  }

  if (isNull(response.body)) {
    return {
      success: false,
      error: 'Slack returned no body',
      reason: 'download-failed',
    };
  }

  const bytes = await readBoundedBody(response.body);

  if (!isDefined(bytes)) {
    return { success: false, error: TOO_LARGE_ERROR, reason: 'download-failed' };
  }

  return { success: true, bytes, contentType: mimeType };
};

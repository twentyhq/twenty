import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_DATA_API_BASE_URL } from 'src/constants/line-api.constant';
import { LINE_INCOMING_ATTACHMENT_MAX_SIZE_BYTES } from 'src/constants/line-incoming-attachment-max-size-bytes.constant';
import { LineApiError } from 'src/logic-functions/data/line-api.error';
import { type LineMessageContent } from 'src/logic-functions/types/line-message-content.type';

const CONTENT_BEING_PREPARED_STATUS = 202;
// 404 once LINE deleted the content, 410 when the user unsent the message
const CONTENT_UNAVAILABLE_STATUSES = [404, 410];

// stops reading past the limit even when the response has no Content-Length
const readBodyWithinLimit = async (
  response: Response,
): Promise<Uint8Array | undefined> => {
  if (
    Number(response.headers.get('content-length') ?? 0) >
    LINE_INCOMING_ATTACHMENT_MAX_SIZE_BYTES
  ) {
    await response.body?.cancel();

    return undefined;
  }

  if (!isDefined(response.body)) {
    return new Uint8Array();
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  for (let read = await reader.read(); !read.done; read = await reader.read()) {
    totalBytes += read.value.byteLength;

    if (totalBytes > LINE_INCOMING_ATTACHMENT_MAX_SIZE_BYTES) {
      await reader.cancel();

      return undefined;
    }

    chunks.push(read.value);
  }

  return Buffer.concat(chunks);
};

// https://developers.line.biz/en/reference/messaging-api/#get-content
export const downloadLineMessageContent = async ({
  accessToken,
  messageId,
}: {
  accessToken: string;
  messageId: string;
}): Promise<LineMessageContent> => {
  const path = `/v2/bot/message/${encodeURIComponent(messageId)}/content`;
  const response = await fetch(`${LINE_DATA_API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === CONTENT_BEING_PREPARED_STATUS) {
    await response.body?.cancel();

    throw new RetryableLogicFunctionError(
      `LINE is still preparing the content of message ${messageId}`,
    );
  }

  if (CONTENT_UNAVAILABLE_STATUSES.includes(response.status)) {
    await response.body?.cancel();

    return { status: 'unavailable' };
  }

  if (!response.ok) {
    throw new LineApiError(
      `LINE API error ${response.status} on GET ${path}: ${await response.text()}`,
      response.status,
      undefined,
    );
  }

  const content = await readBodyWithinLimit(response);

  if (!isDefined(content)) {
    return { status: 'tooLarge' };
  }

  return {
    status: 'downloaded',
    content,
    contentType: response.headers.get('content-type'),
  };
};

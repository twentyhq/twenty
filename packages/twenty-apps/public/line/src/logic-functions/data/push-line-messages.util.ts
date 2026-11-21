import { LineApiError } from 'src/logic-functions/data/line-api.error';
import { lineApiRequest } from 'src/logic-functions/data/line-api-request.util';

type PushResponse = { sentMessages: { id: string }[] };

const RETRY_KEY_ALREADY_ACCEPTED_STATUS = 409;
const MESSAGE_LIMIT_REACHED_STATUS = 429;

const isPushResponse = (body: unknown): body is PushResponse =>
  typeof body === 'object' &&
  body !== null &&
  'sentMessages' in body &&
  Array.isArray(body.sentMessages);

// https://developers.line.biz/en/reference/messaging-api/#send-push-message
export const pushLineMessages = async ({
  accessToken,
  to,
  texts,
  retryKey,
}: {
  accessToken: string;
  to: string;
  texts: string[];
  retryKey: string;
}): Promise<string[]> => {
  try {
    const { sentMessages } = await lineApiRequest<PushResponse>({
      accessToken,
      method: 'POST',
      path: '/v2/bot/message/push',
      headers: { 'X-Line-Retry-Key': retryKey },
      data: { to, messages: texts.map((text) => ({ type: 'text', text })) },
    });

    return sentMessages.map(({ id }) => String(id));
  } catch (error) {
    if (!(error instanceof LineApiError)) {
      throw error;
    }

    // a retry of a push LINE already accepted answers with the original messages
    if (
      error.status === RETRY_KEY_ALREADY_ACCEPTED_STATUS &&
      isPushResponse(error.responseBody)
    ) {
      return error.responseBody.sentMessages.map(({ id }) => String(id));
    }

    if (error.status === MESSAGE_LIMIT_REACHED_STATUS) {
      throw new Error(
        `LINE did not send the reply. The Official Account may have reached its monthly message limit, which replies from Twenty count against. ${error.message}`,
      );
    }

    throw error;
  }
};

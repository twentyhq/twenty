import { isNonEmptyString } from '@sniptt/guards';

import { TELEGRAM_ASSISTANT_REQUEST_OBJECT_NAME_SINGULAR } from 'src/constants/telegram-assistant-request-object-name-singular';

const CODE_FENCE = '```';
const CLOSING_FENCE = `\n${CODE_FENCE}`;
const SHORTENED_NOTICE = 'Shortened to fit Telegram.';

const hasOpenCodeFence = (text: string): boolean =>
  text.split(CODE_FENCE).length % 2 === 0;

const buildTruncationNotice = ({
  requestUrl,
  isPlainText,
}: {
  requestUrl: string | undefined;
  isPlainText: boolean;
}): string => {
  if (!isNonEmptyString(requestUrl)) {
    return `\n\n${SHORTENED_NOTICE} The full answer is on this request in Twenty.`;
  }

  return isPlainText
    ? `\n\n${SHORTENED_NOTICE} Read the full answer in Twenty: ${requestUrl}`
    : `\n\n_${SHORTENED_NOTICE} [Read the full answer in Twenty](${requestUrl})_`;
};

export const buildTelegramAssistantAnswerText = ({
  responseText,
  requestId,
  workspaceBaseUrl,
  maxLength,
  isPlainText,
}: {
  responseText: string;
  requestId: string;
  workspaceBaseUrl: string | undefined;
  maxLength: number;
  isPlainText: boolean;
}): string => {
  const characters = [...responseText];

  if (characters.length <= maxLength) {
    return responseText;
  }

  const requestUrl = isNonEmptyString(workspaceBaseUrl)
    ? `${workspaceBaseUrl}/object/${TELEGRAM_ASSISTANT_REQUEST_OBJECT_NAME_SINGULAR}/${requestId}`
    : undefined;
  const notice = buildTruncationNotice({ requestUrl, isPlainText });
  const head = characters
    .slice(0, maxLength - notice.length - CLOSING_FENCE.length)
    .join('');
  const lastLineBreakIndex = head.lastIndexOf('\n');
  const keptText =
    lastLineBreakIndex > head.length / 2
      ? head.slice(0, lastLineBreakIndex)
      : head;

  const closingFence =
    !isPlainText && hasOpenCodeFence(keptText) ? CLOSING_FENCE : '';

  return `${keptText}${closingFence}${notice}`;
};

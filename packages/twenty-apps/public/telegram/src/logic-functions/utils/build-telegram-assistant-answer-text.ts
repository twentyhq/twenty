import { isNonEmptyString } from '@sniptt/guards';

import { TELEGRAM_ASSISTANT_REQUEST_OBJECT_NAME_SINGULAR } from 'src/constants/telegram-assistant-request-object-name-singular';
import { TELEGRAM_RICH_MESSAGE_MAX_LENGTH } from 'src/logic-functions/constants/telegram-rich-message-max-length';

const CODE_FENCE = '```';
const CLOSING_FENCE = `\n${CODE_FENCE}`;

const hasOpenCodeFence = (text: string): boolean =>
  text.split(CODE_FENCE).length % 2 === 0;

export const buildTelegramAssistantAnswerText = ({
  responseText,
  requestId,
  workspaceBaseUrl,
}: {
  responseText: string;
  requestId: string;
  workspaceBaseUrl: string | undefined;
}): string => {
  const characters = [...responseText];

  if (characters.length <= TELEGRAM_RICH_MESSAGE_MAX_LENGTH) {
    return responseText;
  }

  const notice = isNonEmptyString(workspaceBaseUrl)
    ? `\n\n_Shortened to fit Telegram. [Read the full answer in Twenty](${workspaceBaseUrl}/object/${TELEGRAM_ASSISTANT_REQUEST_OBJECT_NAME_SINGULAR}/${requestId})_`
    : '\n\n_Shortened to fit Telegram. The full answer is on this request in Twenty._';
  const head = characters
    .slice(
      0,
      TELEGRAM_RICH_MESSAGE_MAX_LENGTH - notice.length - CLOSING_FENCE.length,
    )
    .join('');
  const lastLineBreakIndex = head.lastIndexOf('\n');
  const keptText =
    lastLineBreakIndex > head.length / 2
      ? head.slice(0, lastLineBreakIndex)
      : head;

  return `${keptText}${hasOpenCodeFence(keptText) ? CLOSING_FENCE : ''}${notice}`;
};

import { isNonEmptyString } from '@sniptt/guards';

const EXCERPT_MAX_LENGTH = 200;

export const buildFailedReplyNotificationText = ({
  recipientName,
  reason,
  replyText,
}: {
  recipientName: string;
  reason: string;
  replyText: string;
}) => {
  const trimmedReply = replyText.trim();
  const excerpt =
    trimmedReply.length > EXCERPT_MAX_LENGTH
      ? `${trimmedReply.slice(0, EXCERPT_MAX_LENGTH)}…`
      : trimmedReply;

  return [
    `A Messenger reply to ${recipientName} was not sent: ${reason}`,
    isNonEmptyString(excerpt) ? `Reply: "${excerpt}"` : undefined,
  ]
    .filter(isNonEmptyString)
    .join('\n\n');
};

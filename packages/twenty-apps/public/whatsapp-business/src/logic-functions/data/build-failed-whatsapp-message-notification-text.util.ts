import { isNonEmptyString } from '@sniptt/guards';

const MESSAGE_PREVIEW_MAX_LENGTH = 120;

export const buildFailedWhatsAppMessageNotificationText = ({
  recipient,
  statusError,
  messageText,
}: {
  recipient: string | undefined;
  statusError: string | null;
  messageText: string | null;
}): string => {
  const preview =
    isNonEmptyString(messageText) && messageText.length > MESSAGE_PREVIEW_MAX_LENGTH
      ? `${messageText.slice(0, MESSAGE_PREVIEW_MAX_LENGTH)}…`
      : messageText;

  return [
    `Not delivered to ${recipient ?? 'an unknown recipient'}${isNonEmptyString(statusError) ? `: ${statusError}` : ''}`,
    isNonEmptyString(preview) ? `"${preview}"` : undefined,
  ]
    .filter(isNonEmptyString)
    .join('\n\n');
};

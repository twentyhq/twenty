const TELEGRAM_ASSISTANT_REQUEST_NAME_MAX_LENGTH = 60;

export const buildTelegramAssistantRequestName = (
  requestText: string,
): string => {
  const characters = [...requestText];

  if (characters.length <= TELEGRAM_ASSISTANT_REQUEST_NAME_MAX_LENGTH) {
    return requestText;
  }

  return `${characters
    .slice(0, TELEGRAM_ASSISTANT_REQUEST_NAME_MAX_LENGTH - 1)
    .join('')}…`;
};

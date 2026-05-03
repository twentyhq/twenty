// Slack chat text limit per https://api.slack.com/reference/messaging
export const SLACK_MESSAGE_TEXT_MAX_CHARS = 40_000;

export const validateSlackMessageText = (
  text: string,
): string | undefined => {
  if (text.length > SLACK_MESSAGE_TEXT_MAX_CHARS) {
    return `Message text exceeds Slack limit of ${SLACK_MESSAGE_TEXT_MAX_CHARS} characters.`;
  }

  return undefined;
};

const SLACK_ASSISTANT_REQUEST_NAME_MAX_LENGTH = 60;

export const buildSlackAssistantRequestName = (requestText: string): string => {
  const codePoints = [...requestText];

  if (codePoints.length <= SLACK_ASSISTANT_REQUEST_NAME_MAX_LENGTH) {
    return requestText;
  }

  return `${codePoints.slice(0, SLACK_ASSISTANT_REQUEST_NAME_MAX_LENGTH - 1).join('')}…`;
};

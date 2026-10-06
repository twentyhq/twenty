const TEAMS_ASSISTANT_REQUEST_NAME_MAX_LENGTH = 60;

export const buildTeamsAssistantRequestName = (requestText: string): string => {
  const codePoints = [...requestText];

  if (codePoints.length <= TEAMS_ASSISTANT_REQUEST_NAME_MAX_LENGTH) {
    return requestText;
  }

  return `${codePoints.slice(0, TEAMS_ASSISTANT_REQUEST_NAME_MAX_LENGTH - 1).join('')}…`;
};

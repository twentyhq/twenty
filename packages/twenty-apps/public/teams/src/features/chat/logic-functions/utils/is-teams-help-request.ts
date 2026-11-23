import { TEAMS_ASSISTANT_HELP_REQUESTS } from 'src/features/chat/logic-functions/constants/teams-assistant-help-requests';

export const isTeamsHelpRequest = (requestText: string): boolean =>
  TEAMS_ASSISTANT_HELP_REQUESTS.has(
    requestText
      .trim()
      .toLowerCase()
      .replace(/[!.?]+$/, ''),
  );

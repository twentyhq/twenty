import { TEAMS_ASSISTANT_SUGGESTED_PROMPTS } from 'src/features/chat/logic-functions/constants/teams-assistant-suggested-prompts';
import { TEAMS_PERSONAL_CONVERSATION_TYPE } from 'src/features/chat/logic-functions/constants/teams-personal-conversation-type';
import { type TeamsSuggestedActions } from 'src/features/chat/logic-functions/types/teams-suggested-actions.type';

const TEAMS_SUGGESTED_ACTIONS_MAX_COUNT = 3;

// A tapped imBack is not documented to mention the bot, which channels need.
export const buildTeamsAssistantHelpSuggestedActions = (
  conversationType: string,
): TeamsSuggestedActions | undefined => {
  if (conversationType !== TEAMS_PERSONAL_CONVERSATION_TYPE) {
    return undefined;
  }

  return {
    actions: TEAMS_ASSISTANT_SUGGESTED_PROMPTS.slice(
      0,
      TEAMS_SUGGESTED_ACTIONS_MAX_COUNT,
    ).map((prompt) => ({ type: 'imBack', title: prompt, value: prompt })),
  };
};

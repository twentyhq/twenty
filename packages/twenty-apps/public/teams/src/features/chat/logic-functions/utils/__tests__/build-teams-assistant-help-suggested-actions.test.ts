import { describe, expect, it } from 'vitest';

import { TEAMS_ASSISTANT_SUGGESTED_PROMPTS } from 'src/features/chat/logic-functions/constants/teams-assistant-suggested-prompts';
import { buildTeamsAssistantHelpSuggestedActions } from 'src/features/chat/logic-functions/utils/build-teams-assistant-help-suggested-actions';

describe('buildTeamsAssistantHelpSuggestedActions', () => {
  it('should offer the example prompts as imBack actions in a personal chat', () => {
    const suggestedActions =
      buildTeamsAssistantHelpSuggestedActions('personal');

    expect(suggestedActions?.actions).toEqual(
      TEAMS_ASSISTANT_SUGGESTED_PROMPTS.map((prompt) => ({
        type: 'imBack',
        title: prompt,
        value: prompt,
      })),
    );
  });

  it.each(['channel', 'groupChat'])(
    'should offer no actions in a %s, where a tap would not mention the bot',
    (conversationType) => {
      expect(
        buildTeamsAssistantHelpSuggestedActions(conversationType),
      ).toBeUndefined();
    },
  );
});

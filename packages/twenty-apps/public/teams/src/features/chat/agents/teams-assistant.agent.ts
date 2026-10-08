import { defineAgent } from 'twenty-sdk/define';

import { DEFAULT_TEAMS_ASSISTANT_PROMPT } from 'src/features/chat/constants/default-teams-assistant-prompt';
import { TEAMS_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: TEAMS_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'teams-assistant',
  label: 'Teams Assistant',
  icon: 'IconMessage',
  description:
    'Conversational CRM assistant reached from Microsoft Teams. Answers questions and acts on workspace data as the workspace member who made the request.',
  prompt: DEFAULT_TEAMS_ASSISTANT_PROMPT,
  responseFormat: { type: 'text' },
});

import { defineAgent } from 'twenty-sdk/define';

import { DEFAULT_SLACK_ASSISTANT_PROMPT } from 'src/constants/default-slack-assistant-prompt';
import {
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The agent shares the app's single role as its CRM tool scope (the ceiling),
// never an identity it acts under. Each request runs as the linked workspace
// member (see the worker), so the member's own permissions apply within that
// scope; an unlinked user is declined rather than answered under the scope.
export default defineAgent({
  universalIdentifier: SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant',
  label: 'Slack Assistant',
  icon: 'IconBrandSlack',
  description:
    'Conversational CRM assistant reached from Slack. Answers questions and acts on workspace data as the linked workspace member who made the request.',
  prompt: DEFAULT_SLACK_ASSISTANT_PROMPT,
  responseFormat: { type: 'text' },
  roleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});

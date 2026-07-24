import { defineAgent } from 'twenty-sdk/define';

import { DEFAULT_SLACK_ASSISTANT_PROMPT } from 'src/constants/default-slack-assistant-prompt';
import {
  SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant',
  label: 'Slack Assistant',
  icon: 'IconBrandSlack',
  description:
    'Conversational CRM assistant reached from Slack. Answers questions about workspace data using the Slack Assistant role. Widen that role to allow create/update actions.',
  prompt: DEFAULT_SLACK_ASSISTANT_PROMPT,
  responseFormat: { type: 'text' },
  roleUniversalIdentifier: SLACK_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
});

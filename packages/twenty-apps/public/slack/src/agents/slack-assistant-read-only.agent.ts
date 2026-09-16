import { defineAgent } from 'twenty-sdk/define';

import { DEFAULT_SLACK_ASSISTANT_PROMPT } from 'src/constants/default-slack-assistant-prompt';
import {
  SLACK_ASSISTANT_READ_ONLY_AGENT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_READ_ONLY_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: SLACK_ASSISTANT_READ_ONLY_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant-read-only',
  label: 'Slack Assistant (read-only)',
  icon: 'IconBrandSlack',
  description:
    'Read-only variant of the Slack conversational assistant, used in channels whose rule caps the assistant at reading. Answers questions about workspace data using the Slack Assistant (read-only) role.',
  prompt: DEFAULT_SLACK_ASSISTANT_PROMPT,
  responseFormat: { type: 'text' },
  roleUniversalIdentifier: SLACK_ASSISTANT_READ_ONLY_ROLE_UNIVERSAL_IDENTIFIER,
});

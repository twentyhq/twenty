import { defineAgent } from 'twenty-sdk/define';

import { SLACK_ASSISTANT_PROMPT } from 'src/constants/slack-assistant-prompt';
import { SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: SLACK_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant',
  label: 'Slack Assistant',
  icon: 'IconBrandSlack',
  description:
    'Answers @mentions and DMs sent to the Twenty bot in Slack, using CRM tools scoped by the role assigned to this agent.',
  prompt: SLACK_ASSISTANT_PROMPT,
  responseFormat: { type: 'text' },
});

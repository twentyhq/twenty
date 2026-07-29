import { defineAgent } from 'twenty-sdk/define';

import { DEFAULT_SLACK_ASSISTANT_PROMPT } from 'src/constants/default-slack-assistant-prompt';
import {
  SLACK_ASSISTANT_READ_ONLY_AGENT_UNIVERSAL_IDENTIFIER,
  SLACK_ASSISTANT_READ_ONLY_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// A separate agent rather than an extra role passed at call time: runAgent takes
// the agent role as the base of the permission intersection, so binding a
// read-only role to its own agent is what makes read-only channels enforceable
// server-side.
export default defineAgent({
  universalIdentifier: SLACK_ASSISTANT_READ_ONLY_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant-read-only',
  label: 'Slack Assistant (read only)',
  icon: 'IconBrandSlack',
  description:
    'Runs Slack requests coming from channels whose rule is set to read only. Same behaviour as the Slack Assistant, restricted to reading workspace data.',
  prompt: DEFAULT_SLACK_ASSISTANT_PROMPT,
  responseFormat: { type: 'text' },
  roleUniversalIdentifier: SLACK_ASSISTANT_READ_ONLY_ROLE_UNIVERSAL_IDENTIFIER,
});

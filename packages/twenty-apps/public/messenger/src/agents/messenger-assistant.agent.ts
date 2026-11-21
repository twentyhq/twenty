import { defineAgent } from 'twenty-sdk/define';

import { MESSENGER_ASSISTANT_PROMPT } from 'src/constants/messenger-assistant-prompt.constant';
import {
  MESSENGER_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  MESSENGER_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: MESSENGER_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'messenger-assistant',
  label: 'Messenger Assistant',
  icon: 'IconBrandMessenger',
  description:
    'Summarizes Messenger conversations, drafts replies, links conversations to companies and opportunities, and sends replies within 24 hours, always after confirmation.',
  prompt: MESSENGER_ASSISTANT_PROMPT,
  responseFormat: { type: 'text' },
  roleUniversalIdentifier: MESSENGER_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
});

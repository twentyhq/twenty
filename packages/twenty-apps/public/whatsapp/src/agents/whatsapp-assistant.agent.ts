import { defineAgent } from 'twenty-sdk/define';

import { WHATSAPP_ASSISTANT_PROMPT } from 'src/constants/whatsapp-assistant-prompt.constant';
import {
  WHATSAPP_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  WHATSAPP_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: WHATSAPP_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-assistant',
  label: 'WhatsApp Assistant',
  icon: 'IconBrandWhatsapp',
  description:
    'Summarizes WhatsApp conversations, drafts replies, links conversations to companies and opportunities, and sends templates when the 24 hour window is closed, always after confirmation.',
  prompt: WHATSAPP_ASSISTANT_PROMPT,
  responseFormat: { type: 'text' },
  roleUniversalIdentifier: WHATSAPP_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
});

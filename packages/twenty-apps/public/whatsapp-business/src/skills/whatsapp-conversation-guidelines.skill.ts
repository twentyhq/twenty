import { defineSkill } from 'twenty-sdk/define';

import { WHATSAPP_CONVERSATION_SKILL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WHATSAPP_CONVERSATION_GUIDELINES } from 'src/constants/whatsapp-conversation-guidelines.constant';

export default defineSkill({
  universalIdentifier: WHATSAPP_CONVERSATION_SKILL_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-conversation-guidelines',
  label: 'WhatsApp conversation guidelines',
  icon: 'IconBrandWhatsapp',
  description: 'When a WhatsApp message can be sent, which template to use, and how to write for WhatsApp',
  content: WHATSAPP_CONVERSATION_GUIDELINES,
});

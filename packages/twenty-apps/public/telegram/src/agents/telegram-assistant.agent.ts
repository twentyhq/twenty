import { defineAgent } from 'twenty-sdk/define';

import {
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { DEFAULT_TELEGRAM_ASSISTANT_PROMPT } from 'src/logic-functions/constants/default-telegram-assistant-prompt';

export default defineAgent({
  universalIdentifier: TELEGRAM_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'telegram-assistant',
  label: 'Telegram Assistant',
  icon: 'IconMessage',
  description:
    'Conversational CRM assistant reached from Telegram. Answers questions and acts on workspace data as the workspace member who made the request.',
  prompt: DEFAULT_TELEGRAM_ASSISTANT_PROMPT,
  responseFormat: { type: 'text' },
  roleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});

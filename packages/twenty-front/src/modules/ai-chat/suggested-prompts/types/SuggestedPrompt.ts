import type { MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

import { type AiChatPrepromptMode } from '@/ai-chat/types/AiChatPrepromptMode';

export type SuggestedPrompt = {
  id: string;
  label: MessageDescriptor;
  Icon: IconComponent;
  mode?: AiChatPrepromptMode;
  prompts: MessageDescriptor[];
};

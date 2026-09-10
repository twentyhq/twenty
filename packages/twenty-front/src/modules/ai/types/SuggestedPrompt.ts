import type { MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

import { type AgentChatPrepromptMode } from '@/ai/states/agentChatPrepromptState';

export type SuggestedPrompt = {
  id: string;
  label: MessageDescriptor;
  Icon: IconComponent;
  // PREFILL drops the prompt in the composer so it can be completed; SEND asks it
  // straight away, for prompts that need nothing from the user.
  mode?: AgentChatPrepromptMode;
  prompts: MessageDescriptor[];
};

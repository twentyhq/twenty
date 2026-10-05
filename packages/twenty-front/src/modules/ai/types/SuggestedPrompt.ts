import type { MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

import { type AgentChatPrepromptMode } from '@/ai/states/agentChatPrepromptState';

export type SuggestedPrompt = {
  id: string;
  label: MessageDescriptor;
  Icon: IconComponent;
  // PREFILL lets the user complete the prompt; SEND is for prompts needing nothing more.
  mode?: AgentChatPrepromptMode;
  prompts: MessageDescriptor[];
};

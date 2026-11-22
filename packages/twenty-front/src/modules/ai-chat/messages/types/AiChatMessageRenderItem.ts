import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type ThinkingStepPart } from '@/ai-chat/thinking-steps/types/ThinkingStepPart';

export type AiChatMessageRenderItem =
  | {
      type: 'thinking-steps';
      parts: ThinkingStepPart[];
    }
  | {
      type: 'part';
      part: ExtendedUIMessagePart;
    };

import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type ThinkingStepPart } from '@/ai/types/ThinkingStepPart';

export type AssistantMessageRenderItem =
  | {
      type: 'thinking-steps';
      parts: ThinkingStepPart[];
    }
  | {
      type: 'part';
      part: ExtendedUIMessagePart;
    };

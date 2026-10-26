import { type AiChatSchedulingSlot } from '@/ai/types/AiChatSchedulingSlot';

export type AiChatSchedulingAvailability =
  | { status: 'loading' }
  | { status: 'error'; message?: string }
  | {
      status: 'ready' | 'changed';
      date: string;
      slots: readonly AiChatSchedulingSlot[];
    };

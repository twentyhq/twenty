import { type AiChatSchedulingSlot } from '@/ai/types/AiChatSchedulingSlot';

export type AiChatSchedulingAvailability =
  | { status: 'loading'; date: string }
  | { status: 'error'; date: string; message?: string }
  | {
      status: 'ready';
      date: string;
      slots: readonly AiChatSchedulingSlot[];
    };

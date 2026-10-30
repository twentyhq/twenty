import { SETU_AI_ACTION_TERMINAL_STATUSES } from 'twenty-shared/ai';

import { type AiActionStateEntry } from '@/ai/types/AiActionStateEntry';

// Terminal and unavailable actions never change again, so polling stops.
export const isAiActionStatePollable = (entry: AiActionStateEntry): boolean =>
  entry.status === 'loading' ||
  (entry.status === 'available' &&
    !SETU_AI_ACTION_TERMINAL_STATUSES.includes(entry.action.status));

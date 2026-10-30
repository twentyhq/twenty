import { SETU_AI_TASK_TERMINAL_STATUSES } from 'twenty-shared/ai';

import { type AiTaskStateEntry } from '@/ai/types/AiTaskStateEntry';

// Finished and unavailable tasks never change again, so polling stops.
export const isAiTaskStatePollable = (entry: AiTaskStateEntry): boolean =>
  entry.status === 'loading' ||
  (entry.status === 'available' &&
    !SETU_AI_TASK_TERMINAL_STATUSES.includes(entry.task.status));

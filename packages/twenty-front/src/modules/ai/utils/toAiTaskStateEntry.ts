import { parseSetuAiTaskProjection } from 'twenty-shared/ai';

import { type AiTaskStateEntry } from '@/ai/types/AiTaskStateEntry';

export const toAiTaskStateEntry = ({
  isAvailable,
  task,
}: {
  isAvailable: boolean;
  task?: unknown;
}): AiTaskStateEntry => {
  if (!isAvailable) {
    return { status: 'unavailable' };
  }

  const parsed = parseSetuAiTaskProjection(task);

  switch (parsed.status) {
    case 'valid':
      return { status: 'available', task: parsed.task };
    case 'unsupported-version':
      return { status: 'unsupported-version' };
    default:
      return { status: 'unavailable' };
  }
};

import { parseSetuAiActionProjection } from 'twenty-shared/ai';

import { type AiActionStateEntry } from '@/ai/types/AiActionStateEntry';

export const toAiActionStateEntry = ({
  isAvailable,
  action,
}: {
  isAvailable: boolean;
  action?: unknown;
}): AiActionStateEntry => {
  if (!isAvailable) {
    return { status: 'unavailable' };
  }

  const parsed = parseSetuAiActionProjection(action);

  switch (parsed.status) {
    case 'valid':
      return { status: 'available', action: parsed.action };
    case 'unsupported-version':
      return { status: 'unsupported-version' };
    default:
      return { status: 'unavailable' };
  }
};

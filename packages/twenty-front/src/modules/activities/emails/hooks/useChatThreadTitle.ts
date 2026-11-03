import { isNonEmptyString, isNull } from '@sniptt/guards';

import { useChatThreadCounterparts } from '@/activities/emails/hooks/useChatThreadCounterparts';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';

export const useChatThreadTitle = (messageThreadId: string) => {
  const { messages } = useEmailThread(messageThreadId);
  const counterparts = useChatThreadCounterparts(messages);

  if (isNull(counterparts)) {
    return null;
  }

  return counterparts
    .map(({ displayName }) => displayName)
    .filter(isNonEmptyString)
    .join(', ');
};

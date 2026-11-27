import { isNonEmptyString, isNull } from '@sniptt/guards';

import { useChatThreadCounterparts } from '@/activities/emails/hooks/useChatThreadCounterparts';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { isFieldValueRestricted } from 'twenty-shared/utils';

export const useChatThreadTitle = (messageThreadId: string) => {
  const { messages } = useEmailThread(messageThreadId);
  const counterparts = useChatThreadCounterparts(messages);

  // Messages are sorted oldest first and chat apps store the conversation name as subject
  const conversationName = messages.findLast(
    ({ subject }) =>
      isNonEmptyString(subject?.trim()) && !isFieldValueRestricted(subject),
  )?.subject;

  if (isNonEmptyString(conversationName)) {
    return conversationName.trim();
  }

  if (isNull(counterparts)) {
    return null;
  }

  return counterparts
    .map(({ displayName }) => displayName)
    .filter(isNonEmptyString)
    .join(', ');
};

import { useMemo } from 'react';
import { isNull } from '@sniptt/guards';

import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { useOutgoingMessageIds } from '@/activities/emails/hooks/useOutgoingMessageIds';
import { getChatThreadCounterpartNames } from '@/activities/emails/utils/getChatThreadCounterpartNames';

export const useChatThreadTitle = (messageThreadId: string) => {
  const { messages } = useEmailThread(messageThreadId);
  const messageIds = useMemo(() => messages.map(({ id }) => id), [messages]);
  const outgoingMessageIds = useOutgoingMessageIds(messageIds);

  if (isNull(outgoingMessageIds)) {
    return null;
  }

  return getChatThreadCounterpartNames(messages, outgoingMessageIds).join(', ');
};

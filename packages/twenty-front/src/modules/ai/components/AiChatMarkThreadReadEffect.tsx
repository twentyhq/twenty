import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useMarkAiChatThreadRead } from '@/ai/hooks/useMarkAiChatThreadRead';

type AiChatMarkThreadReadEffectProps = {
  threadId: string | null;
  // The id of the newest message, so a thread that grows while it is open is
  // marked read again rather than staying on the cursor it had when opened.
  lastMessageId?: string | undefined;
};

export const AiChatMarkThreadReadEffect = ({
  threadId,
  lastMessageId,
}: AiChatMarkThreadReadEffectProps) => {
  const { markAiChatThreadRead } = useMarkAiChatThreadRead();

  useEffect(() => {
    if (!isDefined(threadId)) {
      return;
    }

    void markAiChatThreadRead(threadId);
    // markAiChatThreadRead is rebuilt on every render, so it is deliberately
    // not a dependency: the read is keyed on which thread is open and how far
    // it has got, not on the identity of the function that records it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, lastMessageId]);

  return null;
};

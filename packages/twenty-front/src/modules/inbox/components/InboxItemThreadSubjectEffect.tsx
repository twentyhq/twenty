import { useEffect } from 'react';
import { isValidUuid } from 'twenty-shared/utils';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';

// The chat reads its thread from global state rather than from props, so
// rendering this subject has to point it at the item's thread.
export const InboxItemThreadSubjectEffect = ({
  threadId,
}: {
  threadId: string;
}) => {
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();

  useEffect(() => {
    if (isValidUuid(threadId)) {
      switchThreadWithDraft(threadId);
    }
  }, [threadId, switchThreadWithDraft]);

  return null;
};

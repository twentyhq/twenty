import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { inboxThreadListThreadsFamilySelector } from '@/inbox/states/selectors/inboxThreadListThreadsFamilySelector';
import { aiChatThreadInboxStatusFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadInboxStatusFamilySelector';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useNavigateToInboxThread } from '@/inbox/hooks/useNavigateToInboxThread';

type InboxSelectionEffectProps = {
  selectedThreadId: string | undefined;
  threads: Pick<AiChatThreadRecord, 'id'>[];
};

export const InboxSelectionEffect = ({
  selectedThreadId,
  threads,
}: InboxSelectionEffectProps) => {
  const { navigateToInboxThread } = useNavigateToInboxThread();
  const inboxThreadListThreads = useAtomFamilySelectorValue(
    inboxThreadListThreadsFamilySelector,
    INBOX_RECENT_THREAD_LIST_SOURCE,
  );
  const { scope: selectedThreadScope } = useAtomFamilySelectorValue(
    aiChatThreadInboxStatusFamilySelector,
    selectedThreadId ?? '',
  );
  const isSelectedThreadInInbox =
    selectedThreadScope === 'INBOX' &&
    inboxThreadListThreads.some(({ id }) => id === selectedThreadId);
  const [lastListedSelection, setLastListedSelection] = useState<{
    threadId: string;
    index: number;
  } | null>(null);

  useEffect(() => {
    if (!isDefined(selectedThreadId)) {
      return;
    }

    const index = threads.findIndex(({ id }) => id === selectedThreadId);

    if (index !== -1) {
      if (
        lastListedSelection?.threadId !== selectedThreadId ||
        lastListedSelection.index !== index
      ) {
        setLastListedSelection({ threadId: selectedThreadId, index });
      }

      return;
    }

    if (
      lastListedSelection?.threadId !== selectedThreadId ||
      isSelectedThreadInInbox
    ) {
      return;
    }

    const nextThread =
      threads[Math.min(lastListedSelection.index, threads.length - 1)];

    navigateToInboxThread({
      threadId: nextThread?.id ?? null,
      replace: true,
    });
  }, [
    isSelectedThreadInInbox,
    lastListedSelection,
    navigateToInboxThread,
    selectedThreadId,
    threads,
  ]);

  return null;
};

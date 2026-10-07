import { useEffect, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type AiChatInboxSelectionEffectProps = {
  selectedThreadId: string | undefined;
  threads: Pick<AgentChatThreadRecord, 'id'>[];
  // Split view always has a chat beside the list; otherwise the list stands alone
  shouldSelectFirstThread: boolean;
};

// A chat leaves the list when it is done, snoozed or deleted; the one that
// takes its place is selected, the way a mail inbox moves on
export const AiChatInboxSelectionEffect = ({
  selectedThreadId,
  threads,
  shouldSelectFirstThread,
}: AiChatInboxSelectionEffectProps) => {
  const navigate = useNavigateApp();
  const agentChatRecentThreads = useAtomStateValue(
    agentChatRecentThreadsSelector,
  );
  const { scope: selectedThreadScope } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    selectedThreadId ?? '',
  );
  const isSelectedThreadInInbox =
    selectedThreadScope === 'INBOX' &&
    agentChatRecentThreads.some(({ id }) => id === selectedThreadId);
  const [lastListedSelection, setLastListedSelection] = useState<{
    threadId: string;
    index: number;
  } | null>(null);

  useEffect(() => {
    const selectThread = (threadId: string | null) =>
      // oxlint-disable-next-line twenty/no-navigate-prefer-link
      navigate(AppPath.AiChatInbox, { threadId }, undefined, {
        replace: true,
      });

    if (!isDefined(selectedThreadId)) {
      if (shouldSelectFirstThread && threads.length > 0) {
        selectThread(threads[0].id);
      }

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

    // A chat opened from a link without being listed stays open, and so does
    // one that left the list by coming back to the inbox, as a done or
    // snoozed chat does when the member writes in it
    if (
      lastListedSelection?.threadId !== selectedThreadId ||
      isSelectedThreadInInbox
    ) {
      return;
    }

    const nextThread =
      threads[Math.min(lastListedSelection.index, threads.length - 1)];

    selectThread(nextThread?.id ?? null);
  }, [
    isSelectedThreadInInbox,
    lastListedSelection,
    navigate,
    selectedThreadId,
    shouldSelectFirstThread,
    threads,
  ]);

  return null;
};

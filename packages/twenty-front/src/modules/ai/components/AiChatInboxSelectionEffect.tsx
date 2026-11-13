import { useEffect, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { inboxThreadListThreadsFamilySelector } from '@/ai/states/selectors/agentChatThreadListThreadsFamilySelector';
import { inboxThreadMemberStateFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type InboxSelectionEffectProps = {
  selectedThreadId: string | undefined;
  threads: Pick<AiChatThreadRecord, 'id'>[];
};

// A chat leaves the list when it is done, snoozed or deleted; the one that
// takes its place is selected, the way a mail inbox moves on. The list is
// watched because generic record deletes, other tabs and reloads change it
// before any chat code hears of it
export const InboxSelectionEffect = ({
  selectedThreadId,
  threads,
}: InboxSelectionEffectProps) => {
  const navigate = useNavigateApp();
  const inboxThreadListThreads = useAtomFamilySelectorValue(
    inboxThreadListThreadsFamilySelector,
    INBOX_RECENT_THREAD_LIST_SOURCE,
  );
  const { scope: selectedThreadScope } = useAtomFamilySelectorValue(
    inboxThreadMemberStateFamilySelector,
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

    // oxlint-disable-next-line twenty/no-navigate-prefer-link
    navigate(
      AppPath.AiChatInbox,
      { threadId: nextThread?.id ?? null },
      undefined,
      { replace: true },
    );
  }, [
    isSelectedThreadInInbox,
    lastListedSelection,
    navigate,
    selectedThreadId,
    threads,
  ]);

  return null;
};

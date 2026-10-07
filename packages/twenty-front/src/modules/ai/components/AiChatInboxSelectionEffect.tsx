import { useEffect, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type AiChatInboxSelectionEffectProps = {
  selectedThreadId: string | undefined;
  threads: Pick<AgentChatThreadRecord, 'id'>[];
};

// A chat leaves the list when it is done, snoozed or deleted; the one that
// takes its place is selected, the way a mail inbox moves on. The list is
// watched because generic record deletes, other tabs and reloads change it
// before any chat code hears of it
export const AiChatInboxSelectionEffect = ({
  selectedThreadId,
  threads,
}: AiChatInboxSelectionEffectProps) => {
  const navigate = useNavigateApp();
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

    // A chat opened from a link without being listed stays open
    if (lastListedSelection?.threadId !== selectedThreadId) {
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
  }, [lastListedSelection, navigate, selectedThreadId, threads]);

  return null;
};

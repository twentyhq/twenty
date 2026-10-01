import { useEffect, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type AiChatInboxSelectionEffectProps = {
  selectedThreadId: string | undefined;
  threads: AgentChatThreadRecord[];
};

// A chat leaves the list when it is done, snoozed or deleted; the one that
// takes its place is selected, the way a mail inbox moves on
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
    const selectThread = (threadId: string | null) =>
      // oxlint-disable-next-line twenty/no-navigate-prefer-link
      navigate(AppPath.AiChatInbox, { threadId }, undefined, {
        replace: true,
      });

    if (!isDefined(selectedThreadId)) {
      if (threads.length > 0) {
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

    // A chat opened from a link without being listed stays open
    if (lastListedSelection?.threadId !== selectedThreadId) {
      return;
    }

    const nextThread =
      threads[Math.min(lastListedSelection.index, threads.length - 1)];

    selectThread(nextThread?.id ?? null);
  }, [lastListedSelection, navigate, selectedThreadId, threads]);

  return null;
};

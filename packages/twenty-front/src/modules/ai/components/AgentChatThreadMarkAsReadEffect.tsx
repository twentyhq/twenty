import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getAgentChatThreadInboxStatus } from '@/ai/utils/getAgentChatThreadInboxStatus';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const isDocumentVisible = () => document.visibilityState === 'visible';

export const AgentChatThreadMarkAsReadEffect = () => {
  const store = useStore();
  // The displayed thread rather than the selected one, which can still be
  // loading or fail to load
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const threadId =
    isDefined(agentChatDisplayedThread) && isValidUuid(agentChatDisplayedThread)
      ? agentChatDisplayedThread
      : null;
  const lastActivityAt = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    threadId ?? '',
  )?.lastActivityAt;
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );
  const [isVisible, setIsVisible] = useState(isDocumentVisible);
  const { markAgentChatThreadAsRead } = useAgentChatThreadParticipants();

  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(isDocumentVisible());

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isDefined(threadId)) {
      return;
    }

    return () =>
      store.set(agentChatThreadVisitState.atom, (visit) =>
        visit?.threadId === threadId ? null : visit,
      );
  }, [store, threadId]);

  useEffect(() => {
    if (
      !isDefined(threadId) ||
      !isVisible ||
      !isDefined(agentChatThreadParticipants) ||
      !isDefined(lastActivityAt)
    ) {
      return;
    }

    const participant = agentChatThreadParticipants[threadId];
    const { isUnread } = getAgentChatThreadInboxStatus({
      lastActivityAt,
      participant,
      now: new Date(),
    });
    const visit = store.get(agentChatThreadVisitState.atom);

    // Taken once per visit, before the read mark, so it sees where the member
    // left off
    if (visit?.threadId !== threadId) {
      store.set(agentChatThreadVisitState.atom, {
        threadId,
        isUnread,
        lastReadAt: participant?.lastReadAt ?? null,
        isKeptUnread: false,
      });
    }

    const isKeptUnread = visit?.threadId === threadId && visit.isKeptUnread;

    if (isUnread && !isKeptUnread) {
      void markAgentChatThreadAsRead(threadId);
    }
  }, [
    isVisible,
    lastActivityAt,
    agentChatThreadParticipants,
    markAgentChatThreadAsRead,
    store,
    threadId,
  ]);

  return null;
};

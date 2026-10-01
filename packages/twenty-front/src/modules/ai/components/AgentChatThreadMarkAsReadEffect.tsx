import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { isAgentChatThreadUnread } from '@/ai/utils/isAgentChatThreadUnread';
import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatThreadKeptUnreadIdState } from '@/ai/states/agentChatThreadKeptUnreadIdState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadUnreadSinceState } from '@/ai/states/agentChatThreadUnreadSinceState';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { agentChatViewedThreadIdState } from '@/ai/states/agentChatViewedThreadIdState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
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
  const thread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    threadId ?? '',
  );
  const lastActivityAt = thread?.lastActivityAt ?? null;
  const [isVisible, setIsVisible] = useState(isDocumentVisible);
  const hasLoadedAgentChatThreadParticipants = useAtomStateValue(
    hasLoadedAgentChatThreadParticipantsState,
  );
  const { markAgentChatThreadAsRead } = useAgentChatThreadParticipants();
  const hasActivity = isDefined(lastActivityAt);
  const [visitId] = useState(() => v4());

  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(isDocumentVisible());

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isDefined(threadId) || !isVisible) {
      return;
    }

    store.set(agentChatViewedThreadIdState.atom, threadId);

    return () => {
      if (store.get(agentChatViewedThreadIdState.atom) === threadId) {
        store.set(agentChatViewedThreadIdState.atom, null);
      }
    };
  }, [isVisible, store, threadId]);

  useEffect(() => {
    if (!isDefined(threadId)) {
      return;
    }

    return () => {
      if (store.get(agentChatThreadKeptUnreadIdState.atom) === threadId) {
        store.set(agentChatThreadKeptUnreadIdState.atom, null);
      }
    };
  }, [store, threadId]);

  // Runs before the read mark below, so it sees where the member left off.
  // Kept for the rest of the visit, as this effect can run again once the
  // thread is already marked read; a later visit mounts a new effect and
  // takes it again
  useEffect(() => {
    const unreadSince = store.get(agentChatThreadUnreadSinceState.atom);

    if (
      !isDefined(threadId) ||
      !hasLoadedAgentChatThreadParticipants ||
      !hasActivity ||
      (unreadSince?.threadId === threadId && unreadSince.visitId === visitId)
    ) {
      return;
    }

    const participant = store.get(agentChatThreadParticipantsState.atom)[
      threadId
    ];

    store.set(agentChatThreadUnreadSinceState.atom, {
      threadId,
      visitId,
      isUnread: isAgentChatThreadUnread(
        store.get(agentChatThreadRecordFamilySelector.selectorFamily(threadId))
          ?.lastActivityAt,
        participant,
      ),
      lastReadAt: participant?.lastReadAt ?? null,
    });
  }, [
    hasActivity,
    hasLoadedAgentChatThreadParticipants,
    store,
    threadId,
    visitId,
  ]);

  useEffect(() => {
    if (
      !isDefined(threadId) ||
      !isVisible ||
      !hasLoadedAgentChatThreadParticipants ||
      !isDefined(lastActivityAt) ||
      store.get(agentChatThreadKeptUnreadIdState.atom) === threadId
    ) {
      return;
    }

    const isUnread = isAgentChatThreadUnread(
      lastActivityAt,
      store.get(agentChatThreadParticipantsState.atom)[threadId],
    );

    if (isUnread) {
      void markAgentChatThreadAsRead(threadId);
    }
  }, [
    hasLoadedAgentChatThreadParticipants,
    isVisible,
    lastActivityAt,
    markAgentChatThreadAsRead,
    store,
    threadId,
  ]);

  return null;
};

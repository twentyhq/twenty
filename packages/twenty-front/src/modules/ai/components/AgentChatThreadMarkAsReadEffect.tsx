import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import {
  isAgentChatThreadUnread,
  isDefined,
  isValidUuid,
} from 'twenty-shared/utils';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadUnreadSinceState } from '@/ai/states/agentChatThreadUnreadSinceState';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { agentChatViewedThreadIdState } from '@/ai/states/agentChatViewedThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { buildAgentChatThreadInboxState } from '@/ai/utils/buildAgentChatThreadInboxState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const isDocumentVisible = () => document.visibilityState === 'visible';

// Mounted where a thread's messages are on screen: the thread is read while
// it is shown in a visible tab, including activity that lands meanwhile, and
// the unread line keeps the position the member opened it at
export const AgentChatThreadMarkAsReadEffect = () => {
  const store = useStore();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const threadId =
    isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread)
      ? currentAiChatThread
      : null;
  const thread = useAtomFamilyStateValue(
    recordStoreFamilyState,
    threadId ?? '',
  ) as AgentChatThreadRecord | null | undefined;
  const lastActivityAt = thread?.lastActivityAt ?? null;
  const [isVisible, setIsVisible] = useState(isDocumentVisible);
  const hasLoadedAgentChatThreadParticipants = useAtomStateValue(
    hasLoadedAgentChatThreadParticipantsState,
  );
  const { markAgentChatThreadAsRead } = useAgentChatThreadParticipants();
  const hasActivity = isDefined(lastActivityAt);

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

  // Runs before the read mark below, so it sees where the member left off.
  // Kept for the rest of the visit, as this effect can run again once the
  // thread is already marked read
  useEffect(() => {
    if (
      !isDefined(threadId) ||
      !hasLoadedAgentChatThreadParticipants ||
      !hasActivity ||
      store.get(agentChatThreadUnreadSinceState.atom)?.threadId === threadId
    ) {
      return;
    }

    const participant = store.get(agentChatThreadParticipantsState.atom)[
      threadId
    ];

    store.set(agentChatThreadUnreadSinceState.atom, {
      threadId,
      isUnread: isAgentChatThreadUnread(
        buildAgentChatThreadInboxState(
          store.get(recordStoreFamilyState.atomFamily(threadId)) as
            | AgentChatThreadRecord
            | null
            | undefined,
          participant,
        ),
      ),
      lastReadAt: participant?.lastReadAt ?? null,
    });
  }, [hasActivity, hasLoadedAgentChatThreadParticipants, store, threadId]);

  useEffect(() => {
    if (
      !isDefined(threadId) ||
      !isVisible ||
      !hasLoadedAgentChatThreadParticipants ||
      !isDefined(lastActivityAt)
    ) {
      return;
    }

    const isUnread = isAgentChatThreadUnread(
      buildAgentChatThreadInboxState(
        { lastActivityAt },
        store.get(agentChatThreadParticipantsState.atom)[threadId],
      ),
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

import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { getAgentChatThreadInboxStatus } from 'twenty-shared/ai';

import { useUpdateInboxThreadStatus } from '@/ai/hooks/useUpdateAgentChatThreadInboxState';
import { inboxDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { inboxReopenedThreadActivityState } from '@/ai/states/agentChatReopenedThreadActivityState';
import { inboxThreadOpenViewCountState } from '@/ai/states/agentChatThreadOpenViewCountState';
import { inboxThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import {
  type InboxThreadVisit,
  inboxThreadVisitState,
} from '@/ai/states/agentChatThreadVisitState';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { isInboxThreadSettledForMember } from '@/ai/utils/isAgentChatThreadSettledForMember';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

const isDocumentVisible = () => document.visibilityState === 'visible';

export const InboxThreadMarkAsReadEffect = () => {
  const store = useStore();
  // The displayed thread rather than the selected one, which can still be
  // loading or fail to load
  const inboxDisplayedThread = useAtomStateValue(inboxDisplayedThreadState);
  const threadId =
    isDefined(inboxDisplayedThread) && isValidUuid(inboxDisplayedThread)
      ? inboxDisplayedThread
      : null;
  const lastActivityAt = useAtomFamilySelectorValue(
    inboxThreadRecordFamilySelector,
    threadId ?? '',
  )?.lastActivityAt;
  const inboxThreadParticipants = useAtomStateValue(
    inboxThreadParticipantsState,
  );
  const [isVisible, setIsVisible] = useState(isDocumentVisible);
  const { updateAgentChatThreadInboxState } = useUpdateInboxThreadStatus();

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

    store.set(inboxThreadOpenViewCountState.atom, (count) => count + 1);

    return () => {
      store.set(inboxThreadOpenViewCountState.atom, (count) => count - 1);

      if (store.get(inboxThreadOpenViewCountState.atom) !== 0) {
        return;
      }

      store.set(inboxThreadVisitState.atom, (visit) =>
        visit?.threadId === threadId ? null : visit,
      );

      // Filed on leave, not on read, so the chat stays put while being read
      const thread = store.get(
        inboxThreadRecordFamilySelector.selectorFamily(threadId),
      );
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;
      const reopenedThreadActivity = store.get(
        inboxReopenedThreadActivityState.atom,
      );

      if (
        isDefined(thread) &&
        isDefined(workspaceMemberId) &&
        thread.lastActivityAt !== reopenedThreadActivity[threadId] &&
        isInboxThreadSettledForMember({
          thread,
          participant: store.get(inboxThreadParticipantsState.atom)?.[threadId],
          workspaceMemberId,
        })
      ) {
        void updateAgentChatThreadInboxState({
          threadIds: [threadId],
          action: AgentChatInboxAction.ARCHIVE,
        });
      }
    };
  }, [store, threadId, updateAgentChatThreadInboxState]);

  useEffect(() => {
    if (
      !isDefined(threadId) ||
      !isVisible ||
      !isDefined(inboxThreadParticipants) ||
      !isDefined(lastActivityAt)
    ) {
      return;
    }

    const participant = inboxThreadParticipants[threadId];
    const { isUnread } = getAgentChatThreadInboxStatus({
      lastActivityAt,
      participant,
    });
    const storedVisit = store.get(inboxThreadVisitState.atom);

    // Taken once per visit, before the read mark, so it sees where the member
    // left off
    const newVisit: InboxThreadVisit = {
      threadId,
      isUnread,
      lastReadAt: participant?.lastReadAt ?? null,
      isKeptUnread: false,
    };
    const visit = storedVisit?.threadId === threadId ? storedVisit : newVisit;

    if (visit !== storedVisit) {
      store.set(inboxThreadVisitState.atom, visit);
    }

    const isReadRequested =
      visit.readRequestedForActivityAt === lastActivityAt &&
      visit.readRequestedForParticipantUpdatedAt === participant?.updatedAt;

    // Opening a chat the member does not participate in yet starts tracking
    // it for them, so later activity in it reads as unread
    if (
      (!isUnread && isDefined(participant)) ||
      visit.isKeptUnread ||
      isReadRequested
    ) {
      return;
    }

    store.set(inboxThreadVisitState.atom, {
      ...visit,
      readRequestedForActivityAt: lastActivityAt,
      readRequestedForParticipantUpdatedAt: participant?.updatedAt,
    });

    void updateAgentChatThreadInboxState({
      threadIds: [threadId],
      action: AgentChatInboxAction.READ,
    });
  }, [
    isVisible,
    lastActivityAt,
    inboxThreadParticipants,
    updateAgentChatThreadInboxState,
    store,
    threadId,
  ]);

  return null;
};

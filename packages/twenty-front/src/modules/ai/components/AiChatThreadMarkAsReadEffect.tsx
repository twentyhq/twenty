import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { getAgentChatThreadInboxStatus } from 'twenty-shared/ai';

import { useUpdateInboxThreadStatus } from '@/inbox/hooks/useUpdateInboxThreadStatus';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { aiChatReopenedThreadActivityState } from '@/ai/states/aiChatReopenedThreadActivityState';
import { aiChatThreadOpenViewCountState } from '@/ai/states/aiChatThreadOpenViewCountState';
import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import {
  type AiChatThreadVisit,
  aiChatThreadVisitState,
} from '@/ai/states/aiChatThreadVisitState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { isAiChatThreadSettledForMember } from '@/ai/utils/isAiChatThreadSettledForMember';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

const isDocumentVisible = () => document.visibilityState === 'visible';

export const AiChatThreadMarkAsReadEffect = () => {
  const store = useStore();
  // The displayed thread rather than the selected one, which can still be
  // loading or fail to load
  const aiChatDisplayedThread = useAtomStateValue(aiChatDisplayedThreadState);
  const threadId =
    isDefined(aiChatDisplayedThread) && isValidUuid(aiChatDisplayedThread)
      ? aiChatDisplayedThread
      : null;
  const lastActivityAt = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId ?? '',
  )?.lastActivityAt;
  const aiChatThreadParticipants = useAtomStateValue(
    aiChatThreadParticipantsState,
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

    store.set(aiChatThreadOpenViewCountState.atom, (count) => count + 1);

    return () => {
      store.set(aiChatThreadOpenViewCountState.atom, (count) => count - 1);

      if (store.get(aiChatThreadOpenViewCountState.atom) !== 0) {
        return;
      }

      store.set(aiChatThreadVisitState.atom, (visit) =>
        visit?.threadId === threadId ? null : visit,
      );

      // Filed on leave, not on read, so the chat stays put while being read
      const thread = store.get(
        aiChatThreadRecordFamilySelector.selectorFamily(threadId),
      );
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;
      const reopenedThreadActivity = store.get(
        aiChatReopenedThreadActivityState.atom,
      );

      if (
        isDefined(thread) &&
        isDefined(workspaceMemberId) &&
        thread.lastActivityAt !== reopenedThreadActivity[threadId] &&
        isAiChatThreadSettledForMember({
          thread,
          participant: store.get(aiChatThreadParticipantsState.atom)?.[
            threadId
          ],
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
      !isDefined(aiChatThreadParticipants) ||
      !isDefined(lastActivityAt)
    ) {
      return;
    }

    const participant = aiChatThreadParticipants[threadId];
    const { isUnread } = getAgentChatThreadInboxStatus({
      lastActivityAt,
      participant,
    });
    const storedVisit = store.get(aiChatThreadVisitState.atom);

    // Taken once per visit, before the read mark, so it sees where the member
    // left off
    const newVisit: AiChatThreadVisit = {
      threadId,
      isUnread,
      lastReadAt: participant?.lastReadAt ?? null,
      isKeptUnread: false,
    };
    const visit = storedVisit?.threadId === threadId ? storedVisit : newVisit;

    if (visit !== storedVisit) {
      store.set(aiChatThreadVisitState.atom, visit);
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

    store.set(aiChatThreadVisitState.atom, {
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
    aiChatThreadParticipants,
    updateAgentChatThreadInboxState,
    store,
    threadId,
  ]);

  return null;
};

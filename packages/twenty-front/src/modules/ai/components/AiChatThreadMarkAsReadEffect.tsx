import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { getAgentChatThreadInboxStatus } from 'twenty-shared/ai';

import { useUpdateAiChatThreadStatus } from '@/ai/hooks/useUpdateAiChatThreadStatus';
import { aiChatReopenedThreadActivityState } from '@/ai/states/aiChatReopenedThreadActivityState';
import { aiChatThreadOpenViewCountFamilyState } from '@/ai/states/aiChatThreadOpenViewCountFamilyState';
import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import {
  type AiChatThreadVisit,
  aiChatThreadVisitFamilyState,
} from '@/ai/states/aiChatThreadVisitFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { isAiChatThreadSettledForMember } from '@/ai/utils/isAiChatThreadSettledForMember';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

const isDocumentVisible = () => document.visibilityState === 'visible';

export const AiChatThreadMarkAsReadEffect = () => {
  const store = useStore();
  const { threadId: aiChatThreadId } = useAiChatInstanceOrThrow();
  const threadId = isValidUuid(aiChatThreadId) ? aiChatThreadId : null;
  const lastActivityAt = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId ?? '',
  )?.lastActivityAt;
  const aiChatThreadParticipants = useAtomStateValue(
    aiChatThreadParticipantsState,
  );
  const [isVisible, setIsVisible] = useState(isDocumentVisible);
  const { updateAgentChatThreadInboxState } = useUpdateAiChatThreadStatus();

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

    const openViewCountAtom = aiChatThreadOpenViewCountFamilyState.atomFamily({
      threadId,
    });

    store.set(openViewCountAtom, (count) => count + 1);

    return () => {
      store.set(openViewCountAtom, (count) => count - 1);

      if (store.get(openViewCountAtom) !== 0) {
        return;
      }

      store.set(aiChatThreadVisitFamilyState.atomFamily({ threadId }), null);

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
    const visitAtom = aiChatThreadVisitFamilyState.atomFamily({ threadId });
    const storedVisit = store.get(visitAtom);

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
      store.set(visitAtom, visit);
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

    store.set(visitAtom, {
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

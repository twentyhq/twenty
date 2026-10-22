import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useUpdateAgentChatThreadInboxState } from '@/ai/hooks/useUpdateAgentChatThreadInboxState';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatThreadOpenViewCountState } from '@/ai/states/agentChatThreadOpenViewCountState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getAgentChatThreadInboxStatus } from '@/ai/utils/getAgentChatThreadInboxStatus';
import { isAgentChatThreadSettledForMember } from '@/ai/utils/isAgentChatThreadSettledForMember';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

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
  const { updateAgentChatThreadInboxState } =
    useUpdateAgentChatThreadInboxState();

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

    store.set(agentChatThreadOpenViewCountState.atom, (count) => count + 1);

    return () => {
      store.set(agentChatThreadOpenViewCountState.atom, (count) => count - 1);

      if (store.get(agentChatThreadOpenViewCountState.atom) !== 0) {
        return;
      }

      store.set(agentChatThreadVisitState.atom, (visit) =>
        visit?.threadId === threadId ? null : visit,
      );

      // Filed on leave, not on read, so the chat stays put while being read
      const thread = store.get(
        agentChatThreadRecordFamilySelector.selectorFamily(threadId),
      );
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;

      if (
        isDefined(thread) &&
        isDefined(workspaceMemberId) &&
        isAgentChatThreadSettledForMember({
          thread,
          participant: store.get(agentChatThreadParticipantsState.atom)?.[
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
      !isDefined(agentChatThreadParticipants) ||
      !isDefined(lastActivityAt)
    ) {
      return;
    }

    const participant = agentChatThreadParticipants[threadId];
    const { isUnread } = getAgentChatThreadInboxStatus({
      lastActivityAt,
      participant,
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

    // Opening a chat the member does not participate in yet starts tracking
    // it for them, so later activity in it reads as unread
    if ((isUnread || !isDefined(participant)) && !isKeptUnread) {
      void updateAgentChatThreadInboxState({
        threadIds: [threadId],
        action: AgentChatInboxAction.READ,
      });
    }
  }, [
    isVisible,
    lastActivityAt,
    agentChatThreadParticipants,
    updateAgentChatThreadInboxState,
    store,
    threadId,
  ]);

  return null;
};

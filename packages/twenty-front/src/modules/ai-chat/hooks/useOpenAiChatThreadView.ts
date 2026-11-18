import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useUpdateAiChatThreadStatus } from '@/ai-chat/hooks/useUpdateAiChatThreadStatus';
import { aiChatReopenedThreadActivityState } from '@/ai-chat/states/aiChatReopenedThreadActivityState';
import { aiChatThreadOpenViewCountFamilyState } from '@/ai-chat/states/aiChatThreadOpenViewCountFamilyState';
import { aiChatThreadParticipantsState } from '@/ai-chat/states/aiChatThreadParticipantsState';
import { aiChatThreadVisitFamilyState } from '@/ai-chat/states/aiChatThreadVisitFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadRecordFamilySelector';
import { isAiChatThreadSettledForMember } from '@/ai-chat/utils/isAiChatThreadSettledForMember';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useOpenAiChatThreadView = (threadId: string | null) => {
  const store = useStore();
  const { updateAgentChatThreadInboxState } = useUpdateAiChatThreadStatus();

  useEffect(() => {
    if (!isDefined(threadId)) {
      return;
    }

    const openViewCountAtom = aiChatThreadOpenViewCountFamilyState.atomFamily({
      threadId,
    });

    store.set(openViewCountAtom, (count) => count + 1);

    const leaveIfNoViewLeft = () => {
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

    return () => {
      store.set(openViewCountAtom, (count) => count - 1);

      if (store.get(openViewCountAtom) === 0) {
        queueMicrotask(leaveIfNoViewLeft);
      }
    };
  }, [store, threadId, updateAgentChatThreadInboxState]);
};

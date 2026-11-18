import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useUpdateAiChatThreadStatus } from '@/ai-chat/threads/hooks/useUpdateAiChatThreadStatus';
import { aiChatReopenedThreadActivityState } from '@/ai-chat/threads/states/aiChatReopenedThreadActivityState';
import { aiChatThreadOpenViewCountFamilyState } from '@/ai-chat/threads/states/aiChatThreadOpenViewCountFamilyState';
import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { aiChatThreadVisitFamilyState } from '@/ai-chat/threads/states/aiChatThreadVisitFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { isAiChatThreadSettledForMember } from '@/ai-chat/threads/utils/isAiChatThreadSettledForMember';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

type AiChatThreadOpenViewEffectProps = {
  threadId: string;
};

export const AiChatThreadOpenViewEffect = ({
  threadId,
}: AiChatThreadOpenViewEffectProps) => {
  const store = useStore();
  const { updateAgentChatThreadInboxState } = useUpdateAiChatThreadStatus();

  useEffect(() => {
    if (!isValidUuid(threadId)) {
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

  return null;
};

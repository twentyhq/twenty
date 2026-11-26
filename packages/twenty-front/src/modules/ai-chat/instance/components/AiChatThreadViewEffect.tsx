import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { aiChatThreadViewOpenCountFamilyState } from '@/ai-chat/states/view/aiChatThreadViewOpenCountFamilyState';
import { aiChatThreadViewVisitFamilyState } from '@/ai-chat/states/view/aiChatThreadViewVisitFamilyState';
import { useUpdateAiChatThreadInboxState } from '@/ai-chat/threads/hooks/useUpdateAiChatThreadInboxState';
import { aiChatReopenedThreadActivityState } from '@/ai-chat/threads/states/aiChatReopenedThreadActivityState';
import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { isAiChatThreadSettledForMember } from '@/ai-chat/threads/utils/isAiChatThreadSettledForMember';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

type AiChatThreadViewEffectProps = {
  threadId: string;
};

export const AiChatThreadViewEffect = ({
  threadId,
}: AiChatThreadViewEffectProps) => {
  const store = useStore();
  const { updateAiChatThreadInboxState } = useUpdateAiChatThreadInboxState();

  useEffect(() => {
    if (!isValidUuid(threadId)) {
      return;
    }

    const openViewCountAtom = aiChatThreadViewOpenCountFamilyState.atomFamily({
      threadId,
    });

    store.set(openViewCountAtom, (count) => count + 1);

    const leaveIfNoViewLeft = () => {
      if (store.get(openViewCountAtom) !== 0) {
        return;
      }

      store.set(
        aiChatThreadViewVisitFamilyState.atomFamily({ threadId }),
        null,
      );

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
          participant: store.get(aiChatThreadParticipantsState.atom)
            .rowsByThreadId[threadId],
          workspaceMemberId,
        })
      ) {
        void updateAiChatThreadInboxState({
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
  }, [store, threadId, updateAiChatThreadInboxState]);

  return null;
};

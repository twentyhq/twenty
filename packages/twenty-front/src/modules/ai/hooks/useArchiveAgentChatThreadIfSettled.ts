import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useUpdateAgentChatThreadInboxState } from '@/ai/hooks/useUpdateAgentChatThreadInboxState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { isAgentChatThreadSettledForMember } from '@/ai/utils/isAgentChatThreadSettledForMember';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const useArchiveAgentChatThreadIfSettled = () => {
  const store = useStore();
  const { updateAgentChatThreadInboxState } =
    useUpdateAgentChatThreadInboxState();

  const archiveAgentChatThreadIfSettled = useCallback(
    (threadId: string) => {
      const thread = store.get(
        agentChatThreadRecordFamilySelector.selectorFamily(threadId),
      );
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;

      if (
        !isDefined(thread) ||
        !isDefined(workspaceMemberId) ||
        !isAgentChatThreadSettledForMember({
          thread,
          participant: store.get(agentChatThreadParticipantsState.atom)?.[
            threadId
          ],
          workspaceMemberId,
        })
      ) {
        return;
      }

      void updateAgentChatThreadInboxState({
        threadIds: [threadId],
        action: AgentChatInboxAction.ARCHIVE_IF_SETTLED,
      });
    },
    [store, updateAgentChatThreadInboxState],
  );

  return { archiveAgentChatThreadIfSettled };
};

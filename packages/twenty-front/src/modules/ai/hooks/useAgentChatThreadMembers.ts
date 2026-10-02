import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatThreadMembers = (
  thread:
    | Pick<
        AgentChatThreadRecord,
        'workspaceMemberId' | 'writerWorkspaceMemberIds'
      >
    | null
    | undefined,
) => {
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  return [
    ...new Set([
      thread?.workspaceMemberId,
      ...(thread?.writerWorkspaceMemberIds ?? []),
    ]),
  ]
    .map((memberId) =>
      currentWorkspaceMembers.find(({ id }) => id === memberId),
    )
    .filter(isDefined);
};

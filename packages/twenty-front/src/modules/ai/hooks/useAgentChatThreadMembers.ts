import { isDefined } from 'twenty-shared/utils';

import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useInboxThreadMembers = (
  thread:
    | Pick<InboxThreadRecord, 'workspaceMemberId' | 'writerWorkspaceMemberIds'>
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

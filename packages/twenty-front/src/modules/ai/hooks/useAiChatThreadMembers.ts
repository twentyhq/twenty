import { isDefined } from 'twenty-shared/utils';

import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatThreadMembers = (
  thread:
    | Pick<AiChatThreadRecord, 'workspaceMemberId' | 'writerWorkspaceMemberIds'>
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

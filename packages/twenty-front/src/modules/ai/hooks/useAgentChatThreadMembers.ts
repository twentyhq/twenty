import { agentChatThreadPreviewFamilySelector } from '@/ai/states/selectors/agentChatThreadPreviewFamilySelector';
import { getAgentChatThreadMembers } from '@/ai/utils/getAgentChatThreadMembers';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatThreadMembers = ({
  threadId,
  ownerWorkspaceMemberId,
}: {
  threadId: string;
  ownerWorkspaceMemberId: string | null | undefined;
}) => {
  const preview = useAtomFamilySelectorValue(
    agentChatThreadPreviewFamilySelector,
    threadId,
  );
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  return getAgentChatThreadMembers({
    ownerWorkspaceMemberId,
    memberIds: preview?.memberIds ?? [],
    workspaceMembers: currentWorkspaceMembers,
  });
};

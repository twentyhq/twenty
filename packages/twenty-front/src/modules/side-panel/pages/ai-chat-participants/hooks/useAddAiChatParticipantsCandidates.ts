import { useAiChatThreadMembers } from '@/ai-chat/threads/hooks/useAiChatThreadMembers';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getAssignAiChatMemberOptions } from '@/side-panel/pages/assign-ai-chat/utils/getAssignAiChatMemberOptions';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAddAiChatParticipantsCandidates = ({
  threadId,
  search,
}: {
  threadId: string;
  search: string;
}) => {
  const thread = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId,
  );
  const participantIds = useAiChatThreadMembers(thread).map(({ id }) => id);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  return getAssignAiChatMemberOptions({
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
    search,
  }).filter(
    ({ workspaceMember }) =>
      workspaceMember.id !== currentWorkspaceMember?.id &&
      !participantIds.includes(workspaceMember.id),
  );
};

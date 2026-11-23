import { useAiChatThreadMembers } from '@/ai-chat/threads/hooks/useAiChatThreadMembers';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getAddAiChatParticipantsMemberOptions } from '@/side-panel/pages/ai-chat-participants/utils/getAddAiChatParticipantsMemberOptions';
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
  const threadMembers = useAiChatThreadMembers(thread);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  return getAddAiChatParticipantsMemberOptions({
    workspaceMembers: currentWorkspaceMembers,
    currentWorkspaceMemberId: currentWorkspaceMember?.id,
    participantWorkspaceMemberIds: threadMembers.map(({ id }) => id),
    search,
  });
};

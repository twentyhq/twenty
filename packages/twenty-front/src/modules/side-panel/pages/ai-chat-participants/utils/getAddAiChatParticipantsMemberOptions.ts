import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  type AssignAiChatMemberOption,
  getAssignAiChatMemberOptions,
} from '@/side-panel/pages/assign-ai-chat/utils/getAssignAiChatMemberOptions';

export const getAddAiChatParticipantsMemberOptions = ({
  workspaceMembers,
  currentWorkspaceMemberId,
  participantWorkspaceMemberIds,
  search,
}: {
  workspaceMembers: PartialWorkspaceMember[];
  currentWorkspaceMemberId: string | undefined;
  participantWorkspaceMemberIds: string[];
  search: string;
}): AssignAiChatMemberOption[] =>
  getAssignAiChatMemberOptions({
    workspaceMembers,
    currentWorkspaceMemberId,
    search,
  }).filter(
    ({ workspaceMember }) =>
      workspaceMember.id !== currentWorkspaceMemberId &&
      !participantWorkspaceMemberIds.includes(workspaceMember.id),
  );

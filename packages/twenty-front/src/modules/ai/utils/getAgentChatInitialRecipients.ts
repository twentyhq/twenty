import { type AgentChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';

export const getAgentChatInitialRecipients = ({
  shouldIncludeInitialRecipients,
  recipientWorkspaceMemberIds,
  workspaceMembers,
}: {
  shouldIncludeInitialRecipients: boolean;
  recipientWorkspaceMemberIds: string[];
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'userEmail'>[];
}): AgentChatParticipantMention[] => {
  if (!shouldIncludeInitialRecipients) {
    return [];
  }

  return workspaceMembers
    .filter(({ id }) => recipientWorkspaceMemberIds.includes(id))
    .map((workspaceMember) => ({
      workspaceMemberId: workspaceMember.id,
      label: getWorkspaceMemberNameOrEmail(workspaceMember),
    }));
};

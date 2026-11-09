import { type AgentChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';

export const getAgentChatInitialRecipients = ({
  recipientWorkspaceMemberIds,
  workspaceMembers,
}: {
  recipientWorkspaceMemberIds: string[];
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'userEmail'>[];
}): AgentChatParticipantMention[] =>
  workspaceMembers
    .filter(({ id }) => recipientWorkspaceMemberIds.includes(id))
    .map((workspaceMember) => ({
      workspaceMemberId: workspaceMember.id,
      label: getWorkspaceMemberNameOrEmail(workspaceMember),
    }));

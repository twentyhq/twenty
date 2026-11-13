import { type AiChatParticipantMention } from '@/ai/types/AiChatParticipantMention';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';

export const getAiChatInitialRecipients = ({
  recipientWorkspaceMemberIds,
  workspaceMembers,
}: {
  recipientWorkspaceMemberIds: string[];
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'userEmail'>[];
}): AiChatParticipantMention[] =>
  workspaceMembers
    .filter(({ id }) => recipientWorkspaceMemberIds.includes(id))
    .map((workspaceMember) => ({
      workspaceMemberId: workspaceMember.id,
      label: getWorkspaceMemberNameOrEmail(workspaceMember),
    }));

import { type InboxParticipantMention } from '@/ai/types/InboxParticipantMention';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';

export const getInboxInitialRecipients = ({
  recipientWorkspaceMemberIds,
  workspaceMembers,
}: {
  recipientWorkspaceMemberIds: string[];
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'userEmail'>[];
}): InboxParticipantMention[] =>
  workspaceMembers
    .filter(({ id }) => recipientWorkspaceMemberIds.includes(id))
    .map((workspaceMember) => ({
      workspaceMemberId: workspaceMember.id,
      label: getWorkspaceMemberNameOrEmail(workspaceMember),
    }));

import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';

import { type AiChatParticipantMention } from '@/ai-chat/composer/types/AiChatParticipantMention';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

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

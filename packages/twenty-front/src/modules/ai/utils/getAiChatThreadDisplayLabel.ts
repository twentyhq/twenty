import { isNonEmptyString } from '@sniptt/guards';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type AiChatThreadDisplayIdentity } from '@/ai/types/AiChatThreadDisplayIdentity';
import { getInboxDirectMessagePeerWorkspaceMemberIds } from '@/ai/utils/getInboxDirectMessagePeerWorkspaceMemberIds';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';

export const getAiChatThreadDisplayLabel = ({
  thread,
  currentWorkspaceMemberId,
  workspaceMembers,
  fallbackLabel,
  formerMemberLabel,
}: {
  thread: AiChatThreadDisplayIdentity | null | undefined;
  currentWorkspaceMemberId: string | undefined;
  workspaceMembers: readonly Pick<
    PartialWorkspaceMember,
    'id' | 'name' | 'userEmail'
  >[];
  fallbackLabel: string;
  formerMemberLabel: string;
}): string => {
  if (
    thread?.conversationType !== AgentChatThreadConversationType.DIRECT_MESSAGE
  ) {
    const title = thread?.title;

    return isNonEmptyString(title) ? title : fallbackLabel;
  }

  const peerWorkspaceMemberIds = getInboxDirectMessagePeerWorkspaceMemberIds({
    thread,
    currentWorkspaceMemberId,
  });

  if (!isNonEmptyArray(peerWorkspaceMemberIds)) {
    return formerMemberLabel;
  }

  return peerWorkspaceMemberIds
    .map((workspaceMemberId) => {
      const workspaceMember = workspaceMembers.find(
        ({ id }) => id === workspaceMemberId,
      );

      return isDefined(workspaceMember)
        ? getWorkspaceMemberNameOrEmail(workspaceMember)
        : formerMemberLabel;
    })
    .join(', ');
};

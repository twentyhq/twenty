import { isDefined } from 'twenty-shared/utils';

import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { useChatThreadParticipants } from '@/ai/hooks/useChatThreadParticipants';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatThreadReadsComponentFamilyState } from '@/ai/states/agentChatThreadReadsComponentFamilyState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatOwnMessageReadReceipt = {
  shouldDisplayReceipt: boolean;
  readers: PartialWorkspaceMember[];
};

// A receipt on every one of your messages repeats the same answer down the
// whole thread, so only the last one you wrote carries it - that is the one
// you are waiting on anyway.
export const useAiChatOwnMessageReadReceipt = (
  messageId: string,
): AiChatOwnMessageReadReceipt => {
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const { isSharedThread } = useChatThreadParticipants(
    agentChatDisplayedThread,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const messages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: agentChatDisplayedThread },
  );
  const reads = useAtomComponentFamilyStateValue(
    agentChatThreadReadsComponentFamilyState,
    { threadId: agentChatDisplayedThread },
  );

  const currentUserWorkspaceId = currentWorkspaceMember?.userWorkspaceId;

  const ownMessages = messages.filter(
    (message) =>
      message.role === AgentMessageRole.USER &&
      isDefined(message.metadata?.authorUserWorkspaceId) &&
      message.metadata.authorUserWorkspaceId === currentUserWorkspaceId,
  );

  const lastOwnMessage = ownMessages.at(-1);

  if (
    !isSharedThread ||
    !isDefined(currentUserWorkspaceId) ||
    lastOwnMessage?.id !== messageId
  ) {
    return { shouldDisplayReceipt: false, readers: [] };
  }

  const messageCreatedAt = lastOwnMessage.metadata?.createdAt;

  if (!isDefined(messageCreatedAt)) {
    return { shouldDisplayReceipt: false, readers: [] };
  }

  const messageCreatedAtTime = new Date(messageCreatedAt).getTime();

  const readers = reads.flatMap((read) => {
    if (
      read.userWorkspaceId === currentUserWorkspaceId ||
      new Date(read.lastReadAt).getTime() < messageCreatedAtTime
    ) {
      return [];
    }

    const reader = currentWorkspaceMembers.find(
      (workspaceMember) =>
        workspaceMember.userWorkspaceId === read.userWorkspaceId,
    );

    return isDefined(reader) ? [reader] : [];
  });

  return { shouldDisplayReceipt: true, readers };
};

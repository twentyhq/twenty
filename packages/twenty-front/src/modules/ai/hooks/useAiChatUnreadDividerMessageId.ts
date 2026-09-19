import { isDefined } from 'twenty-shared/utils';

import { AgentMessageRole } from '@/ai/constants/AgentMessageRole';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatUnreadDividerCursorComponentFamilyState } from '@/ai/states/agentChatUnreadDividerCursorComponentFamilyState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// The first message the reader had not seen when they opened the thread, or
// null when they were already caught up.
export const useAiChatUnreadDividerMessageId = (): string | null => {
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const agentChatMessages = useAtomComponentFamilyStateValue(
    agentChatMessagesComponentFamilyState,
    { threadId: agentChatDisplayedThread },
  );
  const agentChatUnreadDividerCursor = useAtomComponentFamilyStateValue(
    agentChatUnreadDividerCursorComponentFamilyState,
    { threadId: agentChatDisplayedThread },
  );

  if (!agentChatUnreadDividerCursor.hasCaptured) {
    return null;
  }

  const currentUserWorkspaceId = currentWorkspaceMember?.userWorkspaceId;
  const lastReadAtTime = isDefined(agentChatUnreadDividerCursor.lastReadAt)
    ? new Date(agentChatUnreadDividerCursor.lastReadAt).getTime()
    : null;

  const firstUnreadMessage = agentChatMessages.find((message) => {
    // Your own message is never new to you, and a divider directly above one
    // would read as if somebody else had written it.
    if (
      message.role === AgentMessageRole.USER &&
      message.metadata?.authorUserWorkspaceId === currentUserWorkspaceId
    ) {
      return false;
    }

    const createdAt = message.metadata?.createdAt;

    if (!isDefined(createdAt)) {
      return false;
    }

    return (
      lastReadAtTime === null || new Date(createdAt).getTime() > lastReadAtTime
    );
  });

  // A divider above the very first message of a thread you have just started
  // reading says nothing: everything below it is new by definition.
  if (
    !isDefined(firstUnreadMessage) ||
    firstUnreadMessage.id === agentChatMessages.at(0)?.id
  ) {
    return null;
  }

  return firstUnreadMessage.id;
};

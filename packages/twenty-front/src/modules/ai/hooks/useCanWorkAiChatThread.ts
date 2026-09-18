import { isDefined } from 'twenty-shared/utils';

import { useAiChatThreadById } from '@/ai/hooks/useAiChatThreadById';
import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { useChatThreadParticipants } from '@/ai/hooks/useChatThreadParticipants';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Reading a public channel is not working it. Status and assignment belong to
// the thread rather than to each reader, so the server keeps those writes for
// the people who joined the channel, hold a role on it, are in the thread or
// have been handed it; this is the same line, drawn client-side so a passer-by
// is not offered buttons that would be refused.
//
// A thread whose reader is not loaded yet counts as workable, the way thread
// ownership does: the actions disappear once we know they do not apply, rather
// than flickering in on every reader.
export const useCanWorkAiChatThread = (threadId: string): boolean => {
  const thread = useAiChatThreadById(threadId);
  const { participants } = useChatThreadParticipants(threadId);
  const { isCurrentUserChannelWorker } = useChatChannels();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userWorkspaceId = currentWorkspaceMember?.userWorkspaceId;

  if (!isDefined(thread) || !isDefined(userWorkspaceId)) {
    return true;
  }

  if (
    thread.ownerUserWorkspaceId === userWorkspaceId ||
    thread.assigneeUserWorkspaceId === userWorkspaceId ||
    participants.some(
      (participant) => participant.userWorkspaceId === userWorkspaceId,
    )
  ) {
    return true;
  }

  if (!isDefined(thread.channelId)) {
    return false;
  }

  return isCurrentUserChannelWorker(thread.channelId);
};

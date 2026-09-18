import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_INBOX_STATE_ORDER } from '@/ai/constants/AgentChatThreadInboxStateLabels';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { getAgentChatThreadInboxState } from '@/ai/utils/getAgentChatThreadInboxState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// A thread reaches someone's own list the way it does in a shared inbox: it
// was handed to them, or it is theirs to begin with. Everything else stays in
// the channel it belongs to until somebody takes it.
const isThreadInPersonalInbox = (
  thread: FlatAgentChatThread,
  userWorkspaceId: string,
): boolean => {
  if (thread.assigneeUserWorkspaceId === userWorkspaceId) {
    return true;
  }

  return (
    !isDefined(thread.channelId) &&
    !isDefined(thread.workflowRunId) &&
    thread.ownerUserWorkspaceId === userWorkspaceId
  );
};

export const useAiChatInboxThreads = () => {
  const { threads, loading } = useChatThreads();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userWorkspaceId = currentWorkspaceMember?.userWorkspaceId;

  const inboxThreads = isDefined(userWorkspaceId)
    ? threads.filter((thread) =>
        isThreadInPersonalInbox(thread, userWorkspaceId),
      )
    : [];

  const threadsByInboxState = AGENT_CHAT_THREAD_INBOX_STATE_ORDER.reduce(
    (accumulator, inboxState) => {
      accumulator[inboxState] = inboxThreads.filter(
        (thread) => getAgentChatThreadInboxState(thread) === inboxState,
      );

      return accumulator;
    },
    {} as Record<AgentChatThreadInboxState, FlatAgentChatThread[]>,
  );

  return { inboxThreads, threadsByInboxState, loading };
};

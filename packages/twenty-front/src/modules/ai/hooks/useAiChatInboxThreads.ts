import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_INBOX_TAB } from '@/ai/constants/AgentChatInboxTab';
import { AGENT_CHAT_INBOX_TAB_ORDER } from '@/ai/constants/AgentChatInboxTabOrder';
import { AGENT_CHAT_THREAD_INBOX_STATE_ORDER } from '@/ai/constants/AgentChatThreadInboxStateOrder';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { type AgentChatInboxTab } from '@/ai/types/AgentChatInboxTab';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { getAgentChatThreadInboxState } from '@/ai/utils/getAgentChatThreadInboxState';
import { isThreadInAgentChatInboxTab } from '@/ai/utils/isThreadInAgentChatInboxTab';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// A thread reaches someone's own list the way it does in a shared inbox: it
// was handed to them, it called on them by name, or it is a chat they are in
// outside any channel. Everything else stays in the channel it belongs to
// until somebody takes it. Those three reasons are the tabs, so belonging to
// the inbox at all is belonging to one of them.
const isThreadInPersonalInbox = (
  thread: FlatAgentChatThread,
  userWorkspaceId: string,
): boolean =>
  AGENT_CHAT_INBOX_TAB_ORDER.filter(
    (inboxTab) => inboxTab !== AGENT_CHAT_INBOX_TAB.ALL,
  ).some((inboxTab) =>
    isThreadInAgentChatInboxTab(thread, inboxTab, userWorkspaceId),
  );

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

  const getThreadsForInboxStateAndTab = (
    inboxState: AgentChatThreadInboxState,
    inboxTab: AgentChatInboxTab,
  ): FlatAgentChatThread[] =>
    isDefined(userWorkspaceId)
      ? threadsByInboxState[inboxState].filter((thread) =>
          isThreadInAgentChatInboxTab(thread, inboxTab, userWorkspaceId),
        )
      : [];

  const getCountByInboxTab = (
    inboxState: AgentChatThreadInboxState,
  ): Record<AgentChatInboxTab, number> =>
    AGENT_CHAT_INBOX_TAB_ORDER.reduce(
      (accumulator, inboxTab) => {
        accumulator[inboxTab] = getThreadsForInboxStateAndTab(
          inboxState,
          inboxTab,
        ).length;

        return accumulator;
      },
      {} as Record<AgentChatInboxTab, number>,
    );

  return {
    inboxThreads,
    threadsByInboxState,
    getThreadsForInboxStateAndTab,
    getCountByInboxTab,
    loading,
  };
};

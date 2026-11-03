import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatSnoozedThreadListState } from '@/ai/states/agentChatSnoozedThreadListState';
import { useLoadAgentChatChannelThreads } from '@/ai/hooks/useLoadAgentChatChannelThreads';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatShownChannelThreadListSelector } from '@/ai/states/selectors/agentChatShownChannelThreadListSelector';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatInboxThreadPaginationProps = {
  threads: Pick<AgentChatThreadRecord, 'id'>[];
  threadId: string;
  onThreadSelect: (threadId: string) => void;
};

export const AiChatInboxThreadPagination = ({
  threads,
  threadId,
  onThreadSelect,
}: AiChatInboxThreadPaginationProps) => {
  const { t } = useLingui();
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const { fetchMoreAgentChatThreads, fetchMoreAgentChatSnoozedThreads } =
    useRefreshAgentChatThreads();
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatSnoozedThreadList = useAtomStateValue(
    agentChatSnoozedThreadListState,
  );
  const isSnoozed =
    agentChatThreadFilterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED;
  const personalThreadList = isSnoozed
    ? agentChatSnoozedThreadList
    : agentChatThreadList;
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const agentChatShownChannelThreadList = useAtomStateValue(
    agentChatShownChannelThreadListSelector,
  );
  const { loadAgentChatChannelThreads } = useLoadAgentChatChannelThreads();
  const index = threads.findIndex(({ id }) => id === threadId);

  // A chat opened from a link without being listed has no neighbours
  if (index === -1) {
    return null;
  }

  const hasMoreThreads = isDefined(agentChatShownChannelView)
    ? (agentChatShownChannelThreadList?.hasNextPage ?? false)
    : (personalThreadList?.hasNextPage ?? false);
  const fetchMoreThreads = () =>
    isDefined(agentChatShownChannelView)
      ? loadAgentChatChannelThreads('fetch-more')
      : isSnoozed
        ? fetchMoreAgentChatSnoozedThreads()
        : fetchMoreAgentChatThreads();
  const previousThreadId = index > 0 ? threads[index - 1].id : undefined;
  const nextThreadId =
    index < threads.length - 1 ? threads[index + 1].id : undefined;

  // The list loads more chats as it scrolls, but it is not on screen beside
  // a chat page, so the next button loads them instead
  const handleNextClick = () => {
    if (!isDefined(nextThreadId)) {
      void fetchMoreThreads();
      return;
    }

    onThreadSelect(nextThreadId);

    if (index + 1 === threads.length - 1 && hasMoreThreads) {
      void fetchMoreThreads();
    }
  };

  return (
    <>
      <IconButton
        size="sm"
        variant="outline"
        color="neutral"
        aria-label={t`Previous chat`}
        disabled={!isDefined(previousThreadId)}
        onClick={() =>
          isDefined(previousThreadId) && onThreadSelect(previousThreadId)
        }
      >
        <IconChevronUp />
      </IconButton>
      <IconButton
        size="sm"
        variant="outline"
        color="neutral"
        aria-label={t`Next chat`}
        disabled={!isDefined(nextThreadId) && !hasMoreThreads}
        onClick={handleNextClick}
      >
        <IconChevronDown />
      </IconButton>
    </>
  );
};

import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

import { useLoadAgentChatChannelThreads } from '@/ai/hooks/useLoadAgentChatChannelThreads';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatChannelThreadListState } from '@/ai/states/agentChatChannelThreadListState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';
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
  const { fetchMoreAgentChatThreads } = useRefreshAgentChatThreads();
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const agentChatChannelThreadList = useAtomStateValue(
    agentChatChannelThreadListState,
  );
  const { loadAgentChatChannelThreads } = useLoadAgentChatChannelThreads();
  const index = threads.findIndex(({ id }) => id === threadId);

  // A chat opened from a link without being listed has no neighbours
  if (index === -1) {
    return null;
  }

  const hasMoreThreads = isDefined(agentChatShownChannelView)
    ? agentChatChannelThreadList?.viewKey ===
        getAgentChatChannelViewKey(agentChatShownChannelView) &&
      agentChatChannelThreadList.hasNextPage
    : isDefined(agentChatThreadList) && agentChatThreadList.hasNextPage;
  // A channel view pages through its own list
  const fetchMoreThreads = () =>
    isDefined(agentChatShownChannelView)
      ? loadAgentChatChannelThreads('fetch-more')
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

import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useLoadAgentChatThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
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
  const agentChatSelectedThreadListSource = useAtomStateValue(
    agentChatSelectedThreadListSourceState,
  );
  const agentChatThreadList = useAtomFamilyStateValue(
    agentChatThreadListFamilyState,
    getAgentChatThreadListSourceKey(agentChatSelectedThreadListSource),
  );
  const { loadAgentChatThreadList } = useLoadAgentChatThreadList();
  const index = threads.findIndex(({ id }) => id === threadId);

  // A chat opened from a link without being listed has no neighbours
  if (index === -1) {
    return null;
  }

  const hasMoreThreads = agentChatThreadList?.hasNextPage ?? false;
  const fetchMoreThreads = () =>
    loadAgentChatThreadList({
      source: agentChatSelectedThreadListSource,
      mode: 'fetch-more',
    });
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

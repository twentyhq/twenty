import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

import { useLoadAgentChatChannelThreads } from '@/ai/hooks/useLoadAgentChatChannelThreads';
import { useLoadAgentChatInboxTabThreads } from '@/ai/hooks/useLoadAgentChatInboxTabThreads';
import { agentChatInboxTabThreadListFamilyState } from '@/ai/states/agentChatInboxTabThreadListFamilyState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelThreadListSelector } from '@/ai/states/selectors/agentChatShownChannelThreadListSelector';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
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
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatInboxTabThreadList = useAtomFamilyStateValue(
    agentChatInboxTabThreadListFamilyState,
    agentChatThreadFilterStatus,
  );
  const { loadAgentChatInboxTabThreads } = useLoadAgentChatInboxTabThreads();
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
    : (agentChatInboxTabThreadList?.hasNextPage ?? false);
  const fetchMoreThreads = () =>
    isDefined(agentChatShownChannelView)
      ? loadAgentChatChannelThreads('fetch-more')
      : loadAgentChatInboxTabThreads('fetch-more');
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

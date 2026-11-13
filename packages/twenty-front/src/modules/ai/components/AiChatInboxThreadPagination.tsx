import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useLoadInboxThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { inboxThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { inboxSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { getInboxThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type InboxThreadPaginationProps = {
  threads: Pick<AiChatThreadRecord, 'id'>[];
  threadId: string;
  onThreadSelect: (threadId: string) => void;
};

export const InboxThreadPagination = ({
  threads,
  threadId,
  onThreadSelect,
}: InboxThreadPaginationProps) => {
  const { t } = useLingui();
  const inboxSelectedThreadListSource = useAtomStateValue(
    inboxSelectedThreadListSourceState,
  );
  const inboxThreadList = useAtomFamilyStateValue(
    inboxThreadListFamilyState,
    getInboxThreadListSourceKey(inboxSelectedThreadListSource),
  );
  const { loadInboxThreadList } = useLoadInboxThreadList();
  const index = threads.findIndex(({ id }) => id === threadId);

  // A chat opened from a link without being listed has no neighbours
  if (index === -1) {
    return null;
  }

  const hasMoreThreads = inboxThreadList?.hasNextPage ?? false;
  const fetchMoreThreads = () =>
    loadInboxThreadList({
      source: inboxSelectedThreadListSource,
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

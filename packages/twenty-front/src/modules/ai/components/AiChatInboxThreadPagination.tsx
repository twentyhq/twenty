import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

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
  const index = threads.findIndex(({ id }) => id === threadId);

  // A chat opened from a link without being listed has no neighbours
  if (index === -1) {
    return null;
  }

  const previousThreadId = index > 0 ? threads[index - 1].id : undefined;
  const nextThreadId =
    index < threads.length - 1 ? threads[index + 1].id : undefined;

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
        disabled={!isDefined(nextThreadId)}
        onClick={() => isDefined(nextThreadId) && onThreadSelect(nextThreadId)}
      >
        <IconChevronDown />
      </IconButton>
    </>
  );
};

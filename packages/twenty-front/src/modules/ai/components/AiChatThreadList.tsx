import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadListGroup } from '@/ai/components/AiChatThreadListGroup';
import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type AiChatThreadListVariant } from '@/ai/types/AiChatThreadListVariant';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';

type AiChatThreadListProps = {
  threads: AgentChatThreadRecord[];
  variant?: AiChatThreadListVariant;
  selectedThreadIds?: string[];
  checkedThreadIds?: string[];
  onThreadClick: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onThreadCheckboxClick?: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onThreadContextMenu?: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onDetachThread?: (threadId: string) => void;
};

export const AiChatThreadList = ({
  threads,
  variant = 'default',
  selectedThreadIds = [],
  checkedThreadIds = [],
  onThreadClick,
  onThreadCheckboxClick,
  onThreadContextMenu,
  onDetachThread,
}: AiChatThreadListProps) => {
  const selectedThreadIdSet = new Set(selectedThreadIds);
  const checkedThreadIdSet = new Set(checkedThreadIds);

  const renderThread = (thread: AgentChatThreadRecord) => (
    <AiChatThreadListItem
      key={thread.id}
      thread={thread}
      variant={variant}
      isSelected={selectedThreadIdSet.has(thread.id)}
      isChecked={checkedThreadIdSet.has(thread.id)}
      onClick={onThreadClick}
      onCheckboxClick={onThreadCheckboxClick}
      onContextMenu={onThreadContextMenu}
      onDetach={
        isDefined(onDetachThread) ? () => onDetachThread(thread.id) : undefined
      }
    />
  );

  return (
    <>
      {groupThreadsByDate({ threads, variant }).map((dateGroup) => (
        <AiChatThreadListGroup
          key={dateGroup.id}
          title={dateGroup.title}
          variant={variant}
        >
          {dateGroup.threads.map(renderThread)}
        </AiChatThreadListGroup>
      ))}
    </>
  );
};

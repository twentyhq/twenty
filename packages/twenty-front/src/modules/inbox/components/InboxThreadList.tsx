import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { InboxThreadListGroup } from '@/inbox/components/InboxThreadListGroup';
import { InboxThreadListItem } from '@/inbox/components/InboxThreadListItem';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { type AiChatThreadRowVariant } from '@/ai/types/AiChatThreadRowVariant';
import { groupThreadsByDate } from '@/inbox/utils/groupThreadsByDate';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';

type InboxThreadListProps = {
  threads: AiChatThreadRecord[];
  variant?: AiChatThreadRowVariant;
  selectedThreadIds?: string[];
  checkedThreadIds?: string[];
  onThreadClick: (
    thread: AiChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onThreadCheckboxClick?: (
    thread: AiChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onThreadContextMenu?: (
    thread: AiChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onDetachThread?: (threadId: string) => void;
};

export const InboxThreadList = ({
  threads,
  variant = 'default',
  selectedThreadIds = [],
  checkedThreadIds = [],
  onThreadClick,
  onThreadCheckboxClick,
  onThreadContextMenu,
  onDetachThread,
}: InboxThreadListProps) => {
  const { calendarStartDay } = useDateTimeFormat();
  const selectedThreadIdSet = new Set(selectedThreadIds);
  const checkedThreadIdSet = new Set(checkedThreadIds);

  const renderThread = (thread: AiChatThreadRecord) => (
    <InboxThreadListItem
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
      {groupThreadsByDate({ threads, variant, calendarStartDay }).map(
        (dateGroup) => (
          <InboxThreadListGroup
            key={dateGroup.id}
            title={dateGroup.title}
            variant={variant}
          >
            {dateGroup.threads.map(renderThread)}
          </InboxThreadListGroup>
        ),
      )}
    </>
  );
};

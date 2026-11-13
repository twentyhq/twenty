import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { InboxThreadListGroup } from '@/ai/components/InboxThreadListGroup';
import { InboxThreadListItem } from '@/ai/components/InboxThreadListItem';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { type InboxThreadListVariant } from '@/ai/types/InboxThreadListVariant';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';

type InboxThreadListProps = {
  threads: InboxThreadRecord[];
  variant?: InboxThreadListVariant;
  selectedThreadIds?: string[];
  checkedThreadIds?: string[];
  onThreadClick: (
    thread: InboxThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onThreadCheckboxClick?: (
    thread: InboxThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onThreadContextMenu?: (
    thread: InboxThreadRecord,
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

  const renderThread = (thread: InboxThreadRecord) => (
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

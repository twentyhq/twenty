import { type MouseEvent } from 'react';

import { InboxThreadList } from '@/ai/components/AiChatThreadList';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useOpenRecordContextMenu } from '@/object-record/record-selection/hooks/useOpenRecordContextMenu';

type InboxPageThreadListProps = {
  threads: InboxThreadRecord[];
  selectedThreadIds: string[];
  checkedThreadIds: string[];
  onThreadClick: (
    thread: InboxThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onThreadCheckboxClick?: (
    thread: InboxThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
};

export const InboxPageThreadList = ({
  threads,
  selectedThreadIds,
  checkedThreadIds,
  onThreadClick,
  onThreadCheckboxClick,
}: InboxPageThreadListProps) => {
  const { openRecordContextMenu } = useOpenRecordContextMenu();

  return (
    <InboxThreadList
      threads={threads}
      selectedThreadIds={selectedThreadIds}
      checkedThreadIds={checkedThreadIds}
      onThreadClick={onThreadClick}
      onThreadCheckboxClick={onThreadCheckboxClick}
      onThreadContextMenu={(thread, event) =>
        openRecordContextMenu({ event, recordId: thread.id })
      }
    />
  );
};

import { type MouseEvent } from 'react';

import { InboxThreadList } from '@/ai/components/InboxThreadList';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { useOpenRecordContextMenu } from '@/object-record/record-selection/hooks/useOpenRecordContextMenu';

type InboxPageThreadListProps = {
  threads: AiChatThreadRecord[];
  selectedThreadIds: string[];
  checkedThreadIds: string[];
  onThreadClick: (
    thread: AiChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onThreadCheckboxClick?: (
    thread: AiChatThreadRecord,
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

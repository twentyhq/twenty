import { type MouseEvent } from 'react';

import { AiChatThreadList } from '@/ai/components/AiChatThreadList';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useOpenRecordContextMenu } from '@/object-record/record-selection/hooks/useOpenRecordContextMenu';

type AiChatInboxThreadListProps = {
  threads: AgentChatThreadRecord[];
  selectedThreadIds: string[];
  onThreadClick: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
};

export const AiChatInboxThreadList = ({
  threads,
  selectedThreadIds,
  onThreadClick,
}: AiChatInboxThreadListProps) => {
  const { openRecordContextMenu } = useOpenRecordContextMenu();

  return (
    <AiChatThreadList
      threads={threads}
      selectedThreadIds={selectedThreadIds}
      onThreadClick={onThreadClick}
      onThreadContextMenu={(thread, event) =>
        openRecordContextMenu({ event, recordId: thread.id })
      }
    />
  );
};

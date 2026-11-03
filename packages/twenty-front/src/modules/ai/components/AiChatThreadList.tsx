import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadListGroup } from '@/ai/components/AiChatThreadListGroup';
import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type AiChatThreadListVariant } from '@/ai/types/AiChatThreadListVariant';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { groupThreadsBySnoozeTime } from '@/ai/utils/groupThreadsBySnoozeTime';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';

type AiChatThreadListProps = {
  threads: AgentChatThreadRecord[];
  variant?: AiChatThreadListVariant;
  selectedThreadIds?: string[];
  checkedThreadIds?: string[];
  snoozedUntilByThreadId?: Record<string, string>;
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
  snoozedUntilByThreadId,
  onThreadClick,
  onThreadCheckboxClick,
  onThreadContextMenu,
  onDetachThread,
}: AiChatThreadListProps) => {
  const { calendarStartDay, timeZone } = useDateTimeFormat();
  const selectedThreadIdSet = new Set(selectedThreadIds);
  const checkedThreadIdSet = new Set(checkedThreadIds);
  const dateGroups = isDefined(snoozedUntilByThreadId)
    ? groupThreadsBySnoozeTime({
        threads,
        snoozedUntilByThreadId,
        calendarStartDay,
        timeZone,
      })
    : groupThreadsByDate({ threads, variant, calendarStartDay });

  const renderThread = (thread: AgentChatThreadRecord) => (
    <AiChatThreadListItem
      key={thread.id}
      thread={thread}
      variant={variant}
      isSelected={selectedThreadIdSet.has(thread.id)}
      isChecked={checkedThreadIdSet.has(thread.id)}
      snoozedUntil={snoozedUntilByThreadId?.[thread.id]}
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
      {dateGroups.map((dateGroup) => (
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

import { styled } from '@linaria/react';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';

const StyledGroupTitle = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[1]};
`;

type AiChatThreadListProps = {
  threads: AgentChatThreadRecord[];
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
      {groupThreadsByDate(threads).map((dateGroup) => (
        <div key={dateGroup.id}>
          <StyledGroupTitle>{dateGroup.title}</StyledGroupTitle>
          {dateGroup.threads.map(renderThread)}
        </div>
      ))}
    </>
  );
};

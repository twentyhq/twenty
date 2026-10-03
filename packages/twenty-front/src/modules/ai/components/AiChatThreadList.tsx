import { styled } from '@linaria/react';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { type CommandMenuDropdownTriggerEvent } from '@/command-menu-item/hooks/useOpenCommandMenuDropdownAtCursor';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';

const StyledGroupTitle = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[1]};
`;

type AiChatThreadListProps = {
  threads: AgentChatThreadRecord[];
  selectedThreadIds?: string[];
  onThreadClick: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onThreadContextMenu?: (
    thread: AgentChatThreadRecord,
    event: CommandMenuDropdownTriggerEvent,
  ) => void;
  onDetachThread?: (threadId: string) => void;
};

export const AiChatThreadList = ({
  threads,
  selectedThreadIds = [],
  onThreadClick,
  onThreadContextMenu,
  onDetachThread,
}: AiChatThreadListProps) => {
  const selectedThreadIdSet = new Set(selectedThreadIds);

  const renderThread = (thread: AgentChatThreadRecord) => (
    <AiChatThreadListItem
      key={thread.id}
      thread={thread}
      isSelected={selectedThreadIdSet.has(thread.id)}
      onClick={onThreadClick}
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

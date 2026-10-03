import { styled } from '@linaria/react';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type AiChatThreadActionsSurface } from '@/ai/types/AiChatThreadActionsSurface';
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
  surface: AiChatThreadActionsSurface;
  selectedThreadIds?: string[];
  isGroupedByDate?: boolean;
  onThreadClick: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onDetachThread?: (threadId: string) => void;
};

export const AiChatThreadList = ({
  threads,
  surface,
  selectedThreadIds = [],
  isGroupedByDate = true,
  onThreadClick,
  onDetachThread,
}: AiChatThreadListProps) => {
  const selectedThreadIdSet = new Set(selectedThreadIds);

  const renderThread = (thread: AgentChatThreadRecord) => (
    <AiChatThreadListItem
      key={thread.id}
      thread={thread}
      surface={surface}
      isSelected={selectedThreadIdSet.has(thread.id)}
      onClick={onThreadClick}
      onDetach={
        isDefined(onDetachThread) ? () => onDetachThread(thread.id) : undefined
      }
    />
  );

  return (
    <>
      {isGroupedByDate
        ? groupThreadsByDate(threads).map((dateGroup) => (
            <div key={dateGroup.id}>
              <StyledGroupTitle>{dateGroup.title}</StyledGroupTitle>
              {dateGroup.threads.map(renderThread)}
            </div>
          ))
        : threads.map(renderThread)}
    </>
  );
};

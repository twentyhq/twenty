import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { groupRecordChatThreadsByDate } from '@/page-layout/widgets/chat-threads/utils/groupRecordChatThreadsByDate';

const StyledGroup = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledGroupTitle = styled.h3`
  margin: 0;
  padding-inline: ${themeCssVariables.spacing[1]};
`;

const StyledThreads = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
`;

type ChatThreadsListProps = {
  threads: AgentChatThreadRecord[];
  selectedThreadId?: string;
  onThreadClick: (thread: AgentChatThreadRecord) => void;
  onDetachThread: (threadId: string) => void;
};

export const ChatThreadsList = ({
  threads,
  selectedThreadId,
  onThreadClick,
  onDetachThread,
}: ChatThreadsListProps) => (
  <>
    {groupRecordChatThreadsByDate({ threads }).map((group) => (
      <StyledGroup key={group.id} aria-label={group.title}>
        <Text
          render={<StyledGroupTitle />}
          size="sm"
          color="tertiary"
          weight="semibold"
        >
          {group.title}
        </Text>
        <StyledThreads>
          {group.threads.map((thread) => (
            <AiChatThreadListItem
              key={thread.id}
              variant="compact"
              thread={thread}
              isSelected={
                isDefined(selectedThreadId) && thread.id === selectedThreadId
              }
              onClick={onThreadClick}
              onDetach={() => onDetachThread(thread.id)}
            />
          ))}
        </StyledThreads>
      </StyledGroup>
    ))}
  </>
);

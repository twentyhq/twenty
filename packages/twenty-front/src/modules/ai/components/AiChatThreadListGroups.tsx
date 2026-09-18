import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatChannelThreadRow } from '@/ai/components/AiChatChannelThreadRow';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledList = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledGroupTitle = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
  padding: ${themeCssVariables.spacing[8]};
  text-align: center;
`;

type AiChatThreadListGroupsProps = {
  threads: FlatAgentChatThread[];
  emptyLabel: string;
};

export const AiChatThreadListGroups = ({
  threads,
  emptyLabel,
}: AiChatThreadListGroupsProps) => {
  const agentChatThreadGroupBy = useAtomStateValue(agentChatThreadGroupByState);
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  if (threads.length === 0) {
    return <StyledEmptyState>{emptyLabel}</StyledEmptyState>;
  }

  const groups =
    agentChatThreadGroupBy === AGENT_CHAT_THREAD_GROUP_BY.DATE
      ? groupThreadsByDate(threads)
      : [{ id: 'all', title: null, threads }];

  return (
    <StyledList>
      {groups.map((group) => (
        <StyledGroup key={group.id}>
          {isDefined(group.title) && (
            <StyledGroupTitle>{group.title}</StyledGroupTitle>
          )}
          {group.threads.map((thread) => (
            <AiChatChannelThreadRow
              key={thread.id}
              thread={thread}
              isSelected={thread.id === currentAiChatThread}
            />
          ))}
        </StyledGroup>
      ))}
    </StyledList>
  );
};

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatChannelThreadRow } from '@/ai/components/AiChatChannelThreadRow';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
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

type AiChatChannelThreadListProps = {
  channelId: string;
};

export const AiChatChannelThreadList = ({
  channelId,
}: AiChatChannelThreadListProps) => {
  const { t } = useLingui();
  const { threads } = useChatThreads();
  const agentChatThreadGroupBy = useAtomStateValue(agentChatThreadGroupByState);
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const channelThreads = threads.filter(
    (thread) => thread.channelId === channelId,
  );

  if (channelThreads.length === 0) {
    return (
      <StyledEmptyState>{t`No chat in this channel yet`}</StyledEmptyState>
    );
  }

  const groups =
    agentChatThreadGroupBy === AGENT_CHAT_THREAD_GROUP_BY.DATE
      ? groupThreadsByDate(channelThreads)
      : [{ id: 'all', title: null, threads: channelThreads }];

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

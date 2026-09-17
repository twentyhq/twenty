import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';
import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin: 0 auto;
  max-width: 768px;
  padding: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledGroupTitle = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
  padding: ${themeCssVariables.spacing[8]};
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
        <div key={group.id}>
          {group.title !== null && (
            <StyledGroupTitle>{group.title}</StyledGroupTitle>
          )}
          {group.threads.map((thread) => (
            <AiChatThreadListItem key={thread.id} thread={thread} />
          ))}
        </div>
      ))}
    </StyledList>
  );
};

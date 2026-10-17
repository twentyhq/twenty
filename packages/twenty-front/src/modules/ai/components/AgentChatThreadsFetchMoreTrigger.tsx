import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';
import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

type AgentChatThreadsFetchMoreTriggerProps = {
  filterStatus?: AgentChatThreadFilterStatus;
};

export const AgentChatThreadsFetchMoreTrigger = ({
  filterStatus,
}: AgentChatThreadsFetchMoreTriggerProps) => {
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const { fetchMoreAgentChatThreads, fetchMoreAgentChatThreadsInFilterStatus } =
    useRefreshAgentChatThreads();
  const { ref } = useInView({
    onChange: (inView) => {
      if (!inView) {
        return;
      }

      void (isDefined(filterStatus)
        ? fetchMoreAgentChatThreadsInFilterStatus(filterStatus)
        : fetchMoreAgentChatThreads());
    },
  });

  const hasNextPage = isDefined(filterStatus)
    ? agentChatThreadList?.filterStatusPages?.[filterStatus]?.hasNextPage
    : agentChatThreadList?.hasNextPage;

  if (hasNextPage !== true) {
    return null;
  }

  return <StyledFetchMoreTrigger ref={ref} />;
};

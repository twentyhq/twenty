import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

export const AgentChatThreadsFetchMoreTrigger = () => {
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const { fetchMoreAgentChatThreads } = useRefreshAgentChatThreads();
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView) {
        void fetchMoreAgentChatThreads();
      }
    },
  });

  if (!isDefined(agentChatThreadList) || !agentChatThreadList.hasNextPage) {
    return null;
  }

  return <StyledFetchMoreTrigger ref={ref} />;
};

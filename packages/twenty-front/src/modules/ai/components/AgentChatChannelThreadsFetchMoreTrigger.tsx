import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';

import { useLoadAgentChatChannelThreads } from '@/ai/hooks/useLoadAgentChatChannelThreads';
import { agentChatShownChannelThreadListSelector } from '@/ai/states/selectors/agentChatShownChannelThreadListSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

export const AgentChatChannelThreadsFetchMoreTrigger = () => {
  const agentChatShownChannelThreadList = useAtomStateValue(
    agentChatShownChannelThreadListSelector,
  );
  const { loadAgentChatChannelThreads } = useLoadAgentChatChannelThreads();
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView) {
        void loadAgentChatChannelThreads('fetch-more');
      }
    },
  });

  if (
    !isDefined(agentChatShownChannelThreadList) ||
    !agentChatShownChannelThreadList.hasNextPage
  ) {
    return null;
  }

  return <StyledFetchMoreTrigger ref={ref} />;
};

import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';

import { useLoadAgentChatChannelThreads } from '@/ai/hooks/useLoadAgentChatChannelThreads';
import { agentChatChannelThreadListState } from '@/ai/states/agentChatChannelThreadListState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

export const AgentChatChannelThreadsFetchMoreTrigger = () => {
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const agentChatChannelThreadList = useAtomStateValue(
    agentChatChannelThreadListState,
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
    !isDefined(agentChatShownChannelView) ||
    agentChatChannelThreadList?.viewKey !==
      getAgentChatChannelViewKey(agentChatShownChannelView) ||
    !agentChatChannelThreadList.hasNextPage
  ) {
    return null;
  }

  return <StyledFetchMoreTrigger ref={ref} />;
};

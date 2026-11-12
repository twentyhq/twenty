import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';
import { isDefined } from 'twenty-shared/utils';

import { useLoadAgentChatInboxTabThreads } from '@/ai/hooks/useLoadAgentChatInboxTabThreads';
import { agentChatShownInboxTabThreadListSelector } from '@/ai/states/selectors/agentChatShownInboxTabThreadListSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

export const AgentChatInboxTabThreadsFetchMoreTrigger = () => {
  const agentChatShownInboxTabThreadList = useAtomStateValue(
    agentChatShownInboxTabThreadListSelector,
  );
  const { loadAgentChatInboxTabThreads } = useLoadAgentChatInboxTabThreads();
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView) {
        void loadAgentChatInboxTabThreads('fetch-more');
      }
    },
  });

  if (
    !isDefined(agentChatShownInboxTabThreadList) ||
    !agentChatShownInboxTabThreadList.hasNextPage
  ) {
    return null;
  }

  return <StyledFetchMoreTrigger ref={ref} />;
};

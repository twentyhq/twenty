import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';
import { isDefined } from 'twenty-shared/utils';

import { useLoadAgentChatInboxTabThreads } from '@/ai/hooks/useLoadAgentChatInboxTabThreads';
import { agentChatInboxTabThreadListFamilyState } from '@/ai/states/agentChatInboxTabThreadListFamilyState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

export const AgentChatInboxTabThreadsFetchMoreTrigger = () => {
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatInboxTabThreadList = useAtomFamilyStateValue(
    agentChatInboxTabThreadListFamilyState,
    agentChatThreadFilterStatus,
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
    !isDefined(agentChatInboxTabThreadList) ||
    !agentChatInboxTabThreadList.hasNextPage
  ) {
    return null;
  }

  return <StyledFetchMoreTrigger ref={ref} />;
};

import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatSnoozedThreadListState } from '@/ai/states/agentChatSnoozedThreadListState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

type AgentChatThreadsFetchMoreTriggerProps = {
  isSnoozed?: boolean;
};

export const AgentChatThreadsFetchMoreTrigger = ({
  isSnoozed = false,
}: AgentChatThreadsFetchMoreTriggerProps) => {
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const agentChatSnoozedThreadList = useAtomStateValue(
    agentChatSnoozedThreadListState,
  );
  const activeThreadList = isSnoozed
    ? agentChatSnoozedThreadList
    : agentChatThreadList;
  const { fetchMoreAgentChatThreads, fetchMoreAgentChatSnoozedThreads } =
    useRefreshAgentChatThreads();
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView) {
        void (isSnoozed
          ? fetchMoreAgentChatSnoozedThreads()
          : fetchMoreAgentChatThreads());
      }
    },
  });

  if (!isDefined(activeThreadList) || !activeThreadList.hasNextPage) {
    return null;
  }

  return <StyledFetchMoreTrigger ref={ref} />;
};

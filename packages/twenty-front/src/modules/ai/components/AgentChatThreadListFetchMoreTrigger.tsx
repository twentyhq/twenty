import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';

import { useLoadAgentChatThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { type AgentChatThreadListSource } from '@/ai/types/AgentChatThreadListSource';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

type AgentChatThreadListFetchMoreTriggerProps = {
  source: AgentChatThreadListSource;
};

export const AgentChatThreadListFetchMoreTrigger = ({
  source,
}: AgentChatThreadListFetchMoreTriggerProps) => {
  const agentChatThreadList = useAtomFamilyStateValue(
    agentChatThreadListFamilyState,
    getAgentChatThreadListSourceKey(source),
  );
  const { loadAgentChatThreadList } = useLoadAgentChatThreadList();
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView) {
        void loadAgentChatThreadList({ source, mode: 'fetch-more' });
      }
    },
  });

  if (!agentChatThreadList?.hasNextPage) {
    return null;
  }

  return <StyledFetchMoreTrigger ref={ref} />;
};

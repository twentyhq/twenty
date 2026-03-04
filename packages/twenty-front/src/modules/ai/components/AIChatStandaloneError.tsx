import { styled } from '@linaria/react';

import { AIChatErrorRenderer } from '@/ai/components/AIChatErrorRenderer';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatMessageIdsComponentSelector } from '@/ai/states/agentChatMessageIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

const StyledErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

export const AIChatStandaloneError = () => {
  const agentChatIsLoading = useAtomStateValue(agentChatIsLoadingState);

  const agentChatMessageIds = useAtomComponentSelectorValue(
    agentChatMessageIdsComponentSelector,
  );

  const agentChatError = useAtomStateValue(agentChatErrorState);

  const hasMessages = isNonEmptyArray(agentChatMessageIds);

  const shouldRender =
    !hasMessages && isDefined(agentChatError) && !agentChatIsLoading;

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledErrorContainer>
      <AIChatErrorRenderer error={agentChatError} />
    </StyledErrorContainer>
  );
};

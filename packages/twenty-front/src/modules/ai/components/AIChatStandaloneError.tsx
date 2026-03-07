import { styled } from '@linaria/react';

import { AIChatErrorRenderer } from '@/ai/components/AIChatErrorRenderer';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatHasMessageComponentSelector } from '@/ai/states/agentChatHasMessageComponentSelector';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

const StyledErrorContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const AIChatStandaloneError = () => {
  const agentChatIsLoading = useAtomStateValue(agentChatIsLoadingState);

  const agentChatError = useAtomStateValue(agentChatErrorState);

  const hasMessages = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

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

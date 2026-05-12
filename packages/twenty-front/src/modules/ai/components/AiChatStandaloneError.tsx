import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { agentChatHasMessageComponentSelector } from '@/ai/states/selectors/agentChatHasMessageComponentSelector';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

const StyledErrorContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

export const AiChatStandaloneError = () => {
  const agentChatIsLoading = useAtomStateValue(agentChatIsLoadingState);

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatError = useAtomComponentFamilyStateValue(
    agentChatErrorComponentFamilyState,
    { threadId: currentAiChatThread },
  );

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
      <AiChatErrorRenderer error={agentChatError} />
    </StyledErrorContainer>
  );
};

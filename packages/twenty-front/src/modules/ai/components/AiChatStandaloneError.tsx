import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { agentChatHasMessageSelector } from '@/ai/states/selectors/agentChatHasMessageSelector';
import { agentChatIsLoadingSelector } from '@/ai/states/selectors/agentChatIsLoadingSelector';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledErrorContainer = styled(StyledAiChatContentContainer)`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[3]};
`;

export const AiChatStandaloneError = () => {
  const agentChatIsLoading = useAtomStateValue(agentChatIsLoadingSelector);

  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const agentChatError = useAtomFamilyStateValue(agentChatErrorFamilyState, {
    threadId: agentChatDisplayedThread,
  });

  const agentChatHasMessage = useAtomStateValue(agentChatHasMessageSelector);

  const shouldRender =
    !agentChatHasMessage && isDefined(agentChatError) && !agentChatIsLoading;

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledErrorContainer>
      <AiChatErrorRenderer error={agentChatError} />
    </StyledErrorContainer>
  );
};

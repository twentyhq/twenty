import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { aiChatHasMessageSelector } from '@/ai/states/selectors/aiChatHasMessageSelector';
import { aiChatIsLoadingSelector } from '@/ai/states/selectors/aiChatIsLoadingSelector';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
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
  const aiChatIsLoading = useAtomStateValue(aiChatIsLoadingSelector);

  const aiChatDisplayedThread = useAtomStateValue(aiChatDisplayedThreadState);
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId: aiChatDisplayedThread,
  });

  const aiChatHasMessage = useAtomStateValue(aiChatHasMessageSelector);

  const shouldRender =
    !aiChatHasMessage && isDefined(aiChatError) && !aiChatIsLoading;

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledErrorContainer>
      <AiChatErrorRenderer error={aiChatError} />
    </StyledErrorContainer>
  );
};

import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { aiChatHasMessageComponentSelector } from '@/ai/states/selectors/aiChatHasMessageComponentSelector';
import { aiChatIsLoadingFamilySelector } from '@/ai/states/selectors/aiChatIsLoadingFamilySelector';
import { useAiChatInstance } from '@/ai/hooks/useAiChatInstance';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledErrorContainer = styled(StyledAiChatContentContainer)`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[3]};
`;

export const AiChatStandaloneError = () => {
  const { threadId } = useAiChatInstance();
  const aiChatIsLoading = useAtomFamilySelectorValue(
    aiChatIsLoadingFamilySelector,
    threadId,
  );

  const aiChatDisplayedThread = useAtomComponentStateValue(
    aiChatDisplayedThreadComponentState,
  );
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId: aiChatDisplayedThread,
  });

  const aiChatHasMessage = useAtomComponentSelectorValue(
    aiChatHasMessageComponentSelector,
  );

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

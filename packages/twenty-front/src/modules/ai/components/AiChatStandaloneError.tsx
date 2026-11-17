import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { aiChatHasMessageFamilySelector } from '@/ai/states/selectors/aiChatHasMessageFamilySelector';
import { aiChatIsLoadingFamilySelector } from '@/ai/states/selectors/aiChatIsLoadingFamilySelector';
import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
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
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatIsLoading = useAtomFamilySelectorValue(
    aiChatIsLoadingFamilySelector,
    threadId,
  );

  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId,
  });

  const aiChatHasMessage = useAtomFamilySelectorValue(
    aiChatHasMessageFamilySelector,
    threadId,
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

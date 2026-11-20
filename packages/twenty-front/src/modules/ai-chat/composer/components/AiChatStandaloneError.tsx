import { StyledAiChatContentContainer } from '@/ai-chat/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatErrorRenderer } from '@/ai-chat/messages/components/AiChatErrorRenderer';
import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatHasMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatHasMessageFamilySelector';
import { aiChatMessagesLoadingFamilyState } from '@/ai-chat/states/aiChatMessagesLoadingFamilyState';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
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
  const aiChatMessagesLoading = useAtomFamilyStateValue(
    aiChatMessagesLoadingFamilyState,
    { threadId },
  );

  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId,
  });

  const aiChatHasMessage = useAtomFamilySelectorValue(
    aiChatHasMessageFamilySelector,
    threadId,
  );

  const shouldRender =
    !aiChatHasMessage && isDefined(aiChatError) && !aiChatMessagesLoading;

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledErrorContainer>
      <AiChatErrorRenderer error={aiChatError} />
    </StyledErrorContainer>
  );
};

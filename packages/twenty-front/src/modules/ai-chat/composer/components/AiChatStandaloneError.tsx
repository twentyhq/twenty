import { StyledAiChatContentContainer } from '@/ai-chat/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatErrorRenderer } from '@/ai-chat/messages/components/AiChatErrorRenderer';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatHasMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatHasMessageFamilySelector';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
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
  const aiChatThreadIsFetchingMessages = useAtomFamilyStateValue(
    aiChatThreadIsFetchingMessagesFamilyState,
    { threadId },
  );

  const aiChatThreadReplyError = useAtomFamilyStateValue(
    aiChatThreadReplyErrorFamilyState,
    {
      threadId,
    },
  );

  const aiChatHasMessage = useAtomFamilySelectorValue(
    aiChatHasMessageFamilySelector,
    threadId,
  );

  const shouldRender =
    !aiChatHasMessage &&
    isDefined(aiChatThreadReplyError) &&
    !aiChatThreadIsFetchingMessages;

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledErrorContainer>
      <AiChatErrorRenderer error={aiChatThreadReplyError} />
    </StyledErrorContainer>
  );
};

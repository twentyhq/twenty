import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatInitialLoadingIndicator } from '@/ai-chat/messages/components/AiChatInitialLoadingIndicator';
import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatIsStreamingFamilySelector } from '@/ai-chat/states/selectors/aiChatIsStreamingFamilySelector';
import { aiChatIsAssistantReplyPendingFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatIsAssistantReplyPendingFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledPendingResponseWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  width: 100%;
`;

export const AiChatPendingResponseIndicator = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatIsAssistantReplyPending = useAtomFamilySelectorValue(
    aiChatIsAssistantReplyPendingFamilySelector,
    threadId,
  );
  const aiChatIsStreaming = useAtomFamilySelectorValue(
    aiChatIsStreamingFamilySelector,
    threadId,
  );
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId,
  });

  const shouldRender =
    aiChatIsAssistantReplyPending &&
    !aiChatIsStreaming &&
    !isDefined(aiChatError);

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledPendingResponseWrapper>
      <AiChatInitialLoadingIndicator />
    </StyledPendingResponseWrapper>
  );
};

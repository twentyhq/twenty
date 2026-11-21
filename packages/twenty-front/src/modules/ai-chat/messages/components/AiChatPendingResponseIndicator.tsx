import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatInitialLoadingIndicator } from '@/ai-chat/messages/components/AiChatInitialLoadingIndicator';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
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
  const aiChatThreadReplyStatus = useAtomFamilyStateValue(
    aiChatThreadReplyStatusFamilyState,
    { threadId },
  );
  const isAiChatStreaming = aiChatThreadReplyStatus === 'streaming';
  const aiChatThreadReplyError = useAtomFamilyStateValue(
    aiChatThreadReplyErrorFamilyState,
    {
      threadId,
    },
  );

  const shouldRender =
    aiChatIsAssistantReplyPending &&
    !isAiChatStreaming &&
    !isDefined(aiChatThreadReplyError);

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledPendingResponseWrapper>
      <AiChatInitialLoadingIndicator />
    </StyledPendingResponseWrapper>
  );
};

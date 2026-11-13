import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatInitialLoadingIndicator } from '@/ai/components/AiChatInitialLoadingIndicator';
import { aiChatDisplayedThreadState } from '@/ai/states/aiChatDisplayedThreadState';
import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { aiChatIsAssistantReplyPendingFamilySelector } from '@/ai/states/selectors/aiChatIsAssistantReplyPendingFamilySelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledPendingResponseWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  width: 100%;
`;

export const AiChatPendingResponseIndicator = () => {
  const aiChatDisplayedThread = useAtomStateValue(aiChatDisplayedThreadState);
  const aiChatIsAssistantReplyPending = useAtomFamilySelectorValue(
    aiChatIsAssistantReplyPendingFamilySelector,
    aiChatDisplayedThread,
  );
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId: aiChatDisplayedThread },
  );
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId: aiChatDisplayedThread,
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

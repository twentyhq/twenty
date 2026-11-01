import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatInitialLoadingIndicator } from '@/ai/components/AiChatInitialLoadingIndicator';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledPendingResponseWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  width: 100%;
`;

export const AiChatPendingResponseIndicator = () => {
  const agentChatDisplayedThread = useAtomStateValue(
    agentChatDisplayedThreadState,
  );
  const agentChatIsAwaitingFirstChunk = useAtomFamilyStateValue(
    agentChatIsAwaitingFirstChunkFamilyState,
    { threadId: agentChatDisplayedThread },
  );
  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: agentChatDisplayedThread },
  );
  const agentChatError = useAtomFamilyStateValue(agentChatErrorFamilyState, {
    threadId: agentChatDisplayedThread,
  });

  const shouldRender =
    agentChatIsAwaitingFirstChunk &&
    !agentChatIsStreaming &&
    !isDefined(agentChatError);

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledPendingResponseWrapper>
      <AiChatInitialLoadingIndicator />
    </StyledPendingResponseWrapper>
  );
};

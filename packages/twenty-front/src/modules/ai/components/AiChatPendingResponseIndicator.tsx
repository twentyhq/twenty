import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { InboxInitialLoadingIndicator } from '@/ai/components/AiChatInitialLoadingIndicator';
import { inboxDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { inboxIsAssistantReplyPendingFamilySelector } from '@/ai/states/selectors/agentChatIsAssistantReplyPendingFamilySelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledPendingResponseWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  width: 100%;
`;

export const AiChatPendingResponseIndicator = () => {
  const inboxDisplayedThread = useAtomStateValue(inboxDisplayedThreadState);
  const inboxIsAssistantReplyPending = useAtomFamilySelectorValue(
    inboxIsAssistantReplyPendingFamilySelector,
    inboxDisplayedThread,
  );
  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: inboxDisplayedThread },
  );
  const agentChatError = useAtomFamilyStateValue(agentChatErrorFamilyState, {
    threadId: inboxDisplayedThread,
  });

  const shouldRender =
    inboxIsAssistantReplyPending &&
    !agentChatIsStreaming &&
    !isDefined(agentChatError);

  if (!shouldRender) {
    return null;
  }

  return (
    <StyledPendingResponseWrapper>
      <InboxInitialLoadingIndicator />
    </StyledPendingResponseWrapper>
  );
};

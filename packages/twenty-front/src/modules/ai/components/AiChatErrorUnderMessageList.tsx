import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { aiChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { aiChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { aiChatMessageFamilySelector } from '@/ai/states/selectors/agentChatMessageFamilySelector';
import { aiChatMessageIdsSelector } from '@/ai/states/selectors/agentChatMessageIdsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledErrorWrapper = styled.div`
  padding-top: ${themeCssVariables.spacing[3]};
`;

export const AiChatErrorUnderMessageList = () => {
  const aiChatDisplayedThread = useAtomStateValue(aiChatDisplayedThreadState);
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId: aiChatDisplayedThread,
  });
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId: aiChatDisplayedThread },
  );

  const aiChatMessageIds = useAtomStateValue(aiChatMessageIdsSelector);

  const lastMessageId = aiChatMessageIds.at(-1);
  const agentChatMessage = useAtomFamilySelectorValue(
    aiChatMessageFamilySelector,
    { messageId: lastMessageId },
  );

  const showError =
    aiChatError &&
    !aiChatIsStreaming &&
    agentChatMessage?.role === AGENT_MESSAGE_ROLE.USER;

  if (!showError) {
    return null;
  }

  return (
    <StyledErrorWrapper>
      <AiChatErrorRenderer error={aiChatError} />
    </StyledErrorWrapper>
  );
};

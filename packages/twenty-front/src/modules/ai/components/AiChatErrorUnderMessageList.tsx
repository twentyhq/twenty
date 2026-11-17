import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { aiChatThreadMessageFamilySelector } from '@/ai/states/selectors/aiChatThreadMessageFamilySelector';
import { aiChatMessageIdsFamilySelector } from '@/ai/states/selectors/aiChatMessageIdsFamilySelector';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledErrorWrapper = styled.div`
  padding-top: ${themeCssVariables.spacing[3]};
`;

export const AiChatErrorUnderMessageList = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId,
  });
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId },
  );

  const aiChatMessageIds = useAtomFamilySelectorValue(
    aiChatMessageIdsFamilySelector,
    threadId,
  );

  const lastMessageId = aiChatMessageIds.at(-1);
  const agentChatMessage = useAtomFamilySelectorValue(
    aiChatThreadMessageFamilySelector,
    { threadId, messageId: lastMessageId },
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

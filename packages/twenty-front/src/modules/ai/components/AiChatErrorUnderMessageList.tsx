import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { aiChatDisplayedThreadComponentState } from '@/ai/states/aiChatDisplayedThreadComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { aiChatErrorFamilyState } from '@/ai/states/aiChatErrorFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai/states/aiChatIsStreamingFamilyState';
import { aiChatMessageComponentFamilySelector } from '@/ai/states/selectors/aiChatMessageComponentFamilySelector';
import { aiChatMessageIdsComponentSelector } from '@/ai/states/selectors/aiChatMessageIdsComponentSelector';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledErrorWrapper = styled.div`
  padding-top: ${themeCssVariables.spacing[3]};
`;

export const AiChatErrorUnderMessageList = () => {
  const aiChatDisplayedThread = useAtomComponentStateValue(
    aiChatDisplayedThreadComponentState,
  );
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId: aiChatDisplayedThread,
  });
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId: aiChatDisplayedThread },
  );

  const aiChatMessageIds = useAtomComponentSelectorValue(
    aiChatMessageIdsComponentSelector,
  );

  const lastMessageId = aiChatMessageIds.at(-1);
  const agentChatMessage = useAtomComponentFamilySelectorValue(
    aiChatMessageComponentFamilySelector,
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

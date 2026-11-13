import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { AGENT_MESSAGE_ROLE } from '@/ai/constants/AgentMessageRole';
import { inboxDisplayedThreadState } from '@/ai/states/inboxDisplayedThreadState';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { inboxMessageFamilySelector } from '@/ai/states/selectors/inboxMessageFamilySelector';
import { inboxMessageIdsSelector } from '@/ai/states/selectors/inboxMessageIdsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledErrorWrapper = styled.div`
  padding-top: ${themeCssVariables.spacing[3]};
`;

export const AiChatErrorUnderMessageList = () => {
  const inboxDisplayedThread = useAtomStateValue(inboxDisplayedThreadState);
  const agentChatError = useAtomFamilyStateValue(agentChatErrorFamilyState, {
    threadId: inboxDisplayedThread,
  });
  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: inboxDisplayedThread },
  );

  const inboxMessageIds = useAtomStateValue(inboxMessageIdsSelector);

  const lastMessageId = inboxMessageIds.at(-1);
  const agentChatMessage = useAtomFamilySelectorValue(
    inboxMessageFamilySelector,
    { messageId: lastMessageId },
  );

  const showError =
    agentChatError &&
    !agentChatIsStreaming &&
    agentChatMessage?.role === AGENT_MESSAGE_ROLE.USER;

  if (!showError) {
    return null;
  }

  return (
    <StyledErrorWrapper>
      <AiChatErrorRenderer error={agentChatError} />
    </StyledErrorWrapper>
  );
};

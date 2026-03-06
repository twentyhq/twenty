import { AIChatErrorUnderMessageList } from '@/ai/components/AIChatErrorUnderMessageList';
import { AIChatMessage } from '@/ai/components/AIChatMessage';
import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { agentChatMessageIdsComponentSelector } from '@/ai/states/agentChatMessageIdsComponentSelector';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { isNonEmptyArray } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledScrollWrapperContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
  width: calc(100% - 24px);
`;

export const AIChatTabMessageList = () => {
  const agentChatMessageIdsComponent = useAtomComponentSelectorValue(
    agentChatMessageIdsComponentSelector,
  );

  const hasMessages = isNonEmptyArray(agentChatMessageIdsComponent);

  if (!hasMessages) {
    return null;
  }

  return (
    <StyledScrollWrapperContainer>
      <ScrollWrapper componentInstanceId={AI_CHAT_SCROLL_WRAPPER_ID}>
        {agentChatMessageIdsComponent.map((messageId) => {
          return <AIChatMessage messageId={messageId} key={messageId} />;
        })}
        <AIChatErrorUnderMessageList />
      </ScrollWrapper>
    </StyledScrollWrapperContainer>
  );
};

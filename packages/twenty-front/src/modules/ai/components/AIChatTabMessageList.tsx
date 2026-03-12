import { AIChatErrorUnderMessageList } from '@/ai/components/AIChatErrorUnderMessageList';
import { AIChatVirtualizedMessageContainer } from '@/ai/components/AIChatVirtualizedMessageContainer';
import { AIChatVirtualizedPlaceholder } from '@/ai/components/AIChatVirtualizedPlaceholder';
import { AIChatVirtualizedScrollEffect } from '@/ai/components/AIChatVirtualizedScrollEffect';
import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { NUMBER_OF_VIRTUALIZED_CHAT_MESSAGES } from '@/ai/constants/NumberOfVirtualizedChatMessages';
import { agentChatHasMessageComponentSelector } from '@/ai/states/agentChatHasMessageComponentSelector';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { getContiguousIncrementalValues } from 'twenty-shared/utils';
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

const StyledVirtualizationContainer = styled.div`
  position: relative;
  width: 100%;
`;

const virtualIndices = getContiguousIncrementalValues(
  NUMBER_OF_VIRTUALIZED_CHAT_MESSAGES,
);

export const AIChatTabMessageList = () => {
  const hasMessages = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  if (!hasMessages) {
    return null;
  }

  return (
    <StyledScrollWrapperContainer>
      <ScrollWrapper componentInstanceId={AI_CHAT_SCROLL_WRAPPER_ID}>
        <StyledVirtualizationContainer>
          <AIChatVirtualizedPlaceholder />
          {virtualIndices.map((virtualIndex) => (
            <AIChatVirtualizedMessageContainer
              key={virtualIndex}
              virtualIndex={virtualIndex}
            />
          ))}
        </StyledVirtualizationContainer>
        <AIChatErrorUnderMessageList />
        <AIChatVirtualizedScrollEffect />
      </ScrollWrapper>
    </StyledScrollWrapperContainer>
  );
};

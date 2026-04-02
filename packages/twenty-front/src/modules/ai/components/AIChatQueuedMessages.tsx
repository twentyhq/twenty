import { styled } from '@linaria/react';

import { agentChatQueuedMessagesComponentFamilyState } from '@/ai/states/agentChatQueuedMessagesComponentFamilyState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useDeleteQueuedMessage } from '@/ai/hooks/useDeleteQueuedMessage';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { IconX } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledQueueContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledQueueLabel = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledQueuedItem = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledQueuedText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AIChatQueuedMessages = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);
  const agentChatQueuedMessages = useAtomComponentFamilyStateValue(
    agentChatQueuedMessagesComponentFamilyState,
    { threadId: currentAIChatThread },
  );
  const { deleteQueuedMessage } = useDeleteQueuedMessage();

  if (!isDefined(currentAIChatThread) || agentChatQueuedMessages.length === 0) {
    return null;
  }

  return (
    <StyledQueueContainer>
      <StyledQueueLabel>
        {agentChatQueuedMessages.length} Queued
      </StyledQueueLabel>
      {agentChatQueuedMessages.map((message) => {
        const textPart = message.parts?.find((part) => part.type === 'text');
        const displayText = textPart && 'text' in textPart ? textPart.text : '';

        return (
          <StyledQueuedItem key={message.id}>
            <StyledQueuedText>{displayText}</StyledQueuedText>
            <LightIconButton
              Icon={IconX}
              onClick={() => deleteQueuedMessage(message.id)}
              size="small"
            />
          </StyledQueuedItem>
        );
      })}
    </StyledQueueContainer>
  );
};

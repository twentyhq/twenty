import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useWhatsappMessages } from 'src/front-components/hooks/use-whatsapp-messages';

const StyledCenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  height: 100%;
  justify-content: center;
  padding: ${() => themeCssVariables.spacing[4]};
`;

const StyledMessageList = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${() => themeCssVariables.font.family};
  gap: ${() => themeCssVariables.spacing[2]};
  height: 100%;
  overflow-y: auto;
  padding: ${() => themeCssVariables.spacing[4]};
`;

const StyledMessageRow = styled.div`
  background: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.light};
  border-radius: ${() => themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  padding: ${() => themeCssVariables.spacing[2]};
`;

const StyledMessageMeta = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${() => themeCssVariables.font.size.xs};
  gap: ${() => themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledMessageText = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  font-size: ${() => themeCssVariables.font.size.sm};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const WhatsappMessagesContent = ({
  recordId,
}: {
  recordId: string;
}) => {
  const { whatsappMessages, isWhatsappMessagesQueryLoading, errorMessage } =
    useWhatsappMessages(recordId);

  if (isWhatsappMessagesQueryLoading) {
    return <StyledCenteredState>Loading WhatsApp messages…</StyledCenteredState>;
  }

  if (errorMessage !== undefined) {
    return <StyledCenteredState>{errorMessage}</StyledCenteredState>;
  }

  if (whatsappMessages.length === 0) {
    return <StyledCenteredState>No WhatsApp messages yet.</StyledCenteredState>;
  }

  return (
    <StyledMessageList>
      {whatsappMessages.map((whatsappMessage) => (
        <StyledMessageRow key={whatsappMessage.id}>
          <StyledMessageMeta>
            <span>
              {whatsappMessage.direction === 'INCOMING' ? 'Received' : 'Sent'}
            </span>
            <span>{new Date(whatsappMessage.receivedAt).toLocaleString()}</span>
          </StyledMessageMeta>
          <StyledMessageText>{whatsappMessage.text}</StyledMessageText>
        </StyledMessageRow>
      ))}
    </StyledMessageList>
  );
};

import styled from '@emotion/styled';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { sendWhatsappReply } from 'src/front-components/utils/send-whatsapp-reply.util';

const StyledComposer = styled.div`
  border-top: 1px solid ${() => themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${() => themeCssVariables.font.family};
  gap: ${() => themeCssVariables.spacing[1]};
  padding: ${() => themeCssVariables.spacing[2]}
    ${() => themeCssVariables.spacing[4]};
`;

const StyledComposerRow = styled.div`
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledReplyInput = styled.input`
  background: ${() => themeCssVariables.background.primary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.primary};
  flex: 1;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  outline: none;
  padding: ${() => themeCssVariables.spacing[2]};
`;

const StyledSendButton = styled.button`
  background: ${() => themeCssVariables.background.tertiary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: ${() => themeCssVariables.font.color.primary};
  cursor: pointer;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  padding: ${() => themeCssVariables.spacing[2]}
    ${() => themeCssVariables.spacing[3]};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const StyledSendErrorMessage = styled.div`
  color: ${() => themeCssVariables.font.color.danger};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

type WhatsappReplyComposerProps = {
  connectedAccountId: string;
  recipientHandle: string;
  onReplySent: () => void;
};

export const WhatsappReplyComposer = ({
  connectedAccountId,
  recipientHandle,
  onReplySent,
}: WhatsappReplyComposerProps) => {
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [sendErrorMessage, setSendErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const isSendDisabled = replyText.trim().length === 0 || isSendingReply;

  const handleSendReply = async () => {
    if (isSendDisabled) {
      return;
    }

    setIsSendingReply(true);
    setSendErrorMessage(undefined);

    try {
      await sendWhatsappReply({
        connectedAccountId,
        recipientHandle,
        body: replyText.trim(),
      });
      setReplyText('');
      onReplySent();
    } catch (error) {
      setSendErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to send WhatsApp message.',
      );
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <StyledComposer>
      <StyledComposerRow>
        <StyledReplyInput
          placeholder={`Reply to ${recipientHandle}`}
          value={replyText}
          disabled={isSendingReply}
          onChange={(event) => setReplyText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSendReply();
            }
          }}
        />
        <StyledSendButton
          type="button"
          disabled={isSendDisabled}
          onClick={handleSendReply}
        >
          {isSendingReply ? 'Sending…' : 'Send'}
        </StyledSendButton>
      </StyledComposerRow>
      {sendErrorMessage !== undefined && (
        <StyledSendErrorMessage>{sendErrorMessage}</StyledSendErrorMessage>
      )}
    </StyledComposer>
  );
};

import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { type WaConversation, type WaMessage } from '@/whatsapp-chat/types/WhatsAppTypes';
import { useStrukturanalyse } from '@/whatsapp-chat/hooks/useStrukturanalyse';

// ── Styled components ───────────────────────────────────────────

const StyledOverlay = styled.div`
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  inset: 0;
  justify-content: center;
  position: fixed;
  z-index: 200;
`;

const StyledModal = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-width: 420px;
  width: 90vw;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
`;

const StyledTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const StyledCloseButton = styled.button`
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 4px;

  &:hover {
    color: #111827;
  }
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`;

const StyledFooter = styled.div`
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px 20px;
`;

const StyledButton = styled.button<{ variant?: 'primary' }>`
  background: ${({ variant }) => (variant === 'primary' ? '#1A6CFF' : '#FFFFFF')};
  border: 1px solid ${({ variant }) => (variant === 'primary' ? '#1A6CFF' : '#D1D5DB')};
  border-radius: 8px;
  color: ${({ variant }) => (variant === 'primary' ? '#FFFFFF' : '#374151')};
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const StyledError = styled.div`
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #DC2626;
  font-size: 13px;
  padding: 12px;
`;

const StyledImagePreview = styled.img`
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  max-height: 120px;
  object-fit: cover;
  width: 120px;
`;

const StyledPreviewRow = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
`;

const StyledPreviewInfo = styled.div`
  color: #6B7280;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  gap: 4px;
`;

const StyledConfirmText = styled.p`
  color: #374151;
  font-size: 14px;
  margin: 0;
`;

// ── Types ────────────────────────────────────────────────────────

type StrukturanalyseModalProps = {
  message: WaMessage;
  conversation: WaConversation;
  onClose: () => void;
};

// ── Component ───────────────────────────────────────────────────

export const StrukturanalyseModal = ({
  message,
  conversation,
  onClose,
}: StrukturanalyseModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { triggerAnalysis } = useStrukturanalyse(conversation.id);

  const handleRun = useCallback(async () => {
    setError(null);
    setSubmitting(true);

    const triggerResp = await triggerAnalysis({
      messageId: message.id,
      sessionName: conversation.sessionName,
      conversationId: conversation.id,
      email: conversation.contactEmail || undefined,
    });

    if (!triggerResp) {
      setError('Analysis request failed. Please try again.');
      setSubmitting(false);
      return;
    }

    // Analysis triggered — close immediately.
    // Results will appear in the SA tab via WebSocket.
    onClose();
  }, [message, conversation, triggerAnalysis, onClose]);

  const imagePreviewUrl = message.mediaUrl ?? '';

  return (
    <StyledOverlay onClick={onClose}>
      <StyledModal onClick={(e) => e.stopPropagation()}>
        <StyledHeader>
          <StyledTitle>Strukturanalyse</StyledTitle>
          <StyledCloseButton onClick={onClose}>×</StyledCloseButton>
        </StyledHeader>

        <StyledBody>
          {imagePreviewUrl && (
            <StyledPreviewRow>
              <StyledImagePreview src={imagePreviewUrl} alt="Body image" />
              <StyledPreviewInfo>
                <span>Source image from message</span>
                <span>{conversation.contactName || conversation.leadPhoneNumber}</span>
              </StyledPreviewInfo>
            </StyledPreviewRow>
          )}

          <StyledConfirmText>
            Run Strukturanalyse on this image?
          </StyledConfirmText>

          {error && <StyledError>{error}</StyledError>}
        </StyledBody>

        <StyledFooter>
          <StyledButton onClick={onClose}>Cancel</StyledButton>
          <StyledButton variant="primary" onClick={handleRun} disabled={submitting}>
            {submitting ? 'Starting...' : 'Run Analysis'}
          </StyledButton>
        </StyledFooter>
      </StyledModal>
    </StyledOverlay>
  );
};

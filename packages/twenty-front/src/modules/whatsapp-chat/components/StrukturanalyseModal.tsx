import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';

import { type WaConversation, type WaMessage } from '@/whatsapp-chat/types/WhatsAppTypes';
import { useStrukturanalyse, type SaResult } from '@/whatsapp-chat/hooks/useStrukturanalyse';

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
  max-height: 85vh;
  max-width: 560px;
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
  overflow-y: auto;
  padding: 20px;
`;

const StyledFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StyledLabel = styled.label`
  color: #374151;
  font-size: 13px;
  font-weight: 500;
`;

const StyledInput = styled.input`
  background: #F9FAFB;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  color: #111827;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  padding: 10px 12px;

  &:focus {
    border-color: #1A6CFF;
    box-shadow: 0 0 0 2px rgba(26, 108, 255, 0.15);
  }
`;

const StyledFooter = styled.div`
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px 20px;
`;

const StyledButton = styled.button<{ variant?: 'primary' | 'success' }>`
  background: ${({ variant }) => {
    if (variant === 'primary') return '#1A6CFF';
    if (variant === 'success') return '#22C55E';
    return '#FFFFFF';
  }};
  border: 1px solid ${({ variant }) => {
    if (variant === 'primary') return '#1A6CFF';
    if (variant === 'success') return '#22C55E';
    return '#D1D5DB';
  }};
  border-radius: 8px;
  color: ${({ variant }) => (variant ? '#FFFFFF' : '#374151')};
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

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 40px 20px;
`;

const StyledSpinner = styled.div`
  animation: spin 1s linear infinite;
  border: 3px solid #E5E7EB;
  border-radius: 50%;
  border-top-color: #1A6CFF;
  height: 40px;
  width: 40px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const StyledLoadingText = styled.span`
  color: #6B7280;
  font-size: 14px;
`;

const StyledResultImage = styled.img`
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  max-height: 400px;
  object-fit: contain;
  width: 100%;
`;

const StyledAnalysisText = styled.div`
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #374151;
  font-size: 13px;
  line-height: 1.6;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  white-space: pre-wrap;
`;

const StyledError = styled.div`
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  color: #DC2626;
  font-size: 13px;
  padding: 12px;
`;

const StyledSuccessBanner = styled.div`
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 8px;
  color: #166534;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 12px;
  text-align: center;
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

// ── Types ────────────────────────────────────────────────────────

type ModalStep = 'input' | 'running' | 'result';

type StrukturanalyseModalProps = {
  message: WaMessage;
  conversation: WaConversation;
  onClose: () => void;
  /** Called from container when WS `strukturanalyse.complete` arrives */
  onWsComplete?: { pictureId: string; status: string } | null;
};

// ── Component ───────────────────────────────────────────────────

export const StrukturanalyseModal = ({
  message,
  conversation,
  onClose,
  onWsComplete,
}: StrukturanalyseModalProps) => {
  const [step, setStep] = useState<ModalStep>('input');
  const [email, setEmail] = useState(conversation.contactEmail ?? '');
  const [heightCm, setHeightCm] = useState('');
  const [pictureId, setPictureId] = useState<string | null>(null);
  const [result, setResult] = useState<SaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const { triggerAnalysis, getFullResult, sendImage } = useStrukturanalyse(conversation.id);

  // Try to load height from localStorage
  useEffect(() => {
    const savedHeight = localStorage.getItem(
      `sa_height_${conversation.leadPhoneNumber}`,
    );
    if (savedHeight) {
      setHeightCm(savedHeight);
    }
  }, [conversation.leadPhoneNumber]);

  // React to WebSocket completion event
  useEffect(() => {
    if (
      !onWsComplete ||
      step !== 'running' ||
      !pictureId ||
      onWsComplete.pictureId !== pictureId
    ) {
      return;
    }

    if (onWsComplete.status === 'completed') {
      // Fetch the full result with image + text
      getFullResult(pictureId).then((full) => {
        if (full) {
          setResult(full);
          setStep('result');
        } else {
          setError('Could not fetch analysis results.');
          setStep('input');
        }
      });
    } else {
      setError(`Analysis failed (status: ${onWsComplete.status})`);
      setStep('input');
    }
  }, [onWsComplete, step, pictureId, getFullResult]);

  const handleRun = useCallback(async () => {
    if (!email.trim() || !heightCm.trim()) return;

    const h = parseFloat(heightCm);
    if (isNaN(h) || h < 100 || h > 250) {
      setError('Height must be between 100 and 250 cm');
      return;
    }

    // Save height for this contact
    localStorage.setItem(`sa_height_${conversation.leadPhoneNumber}`, heightCm);

    setError(null);
    setStep('running');

    const triggerResp = await triggerAnalysis({
      messageId: message.id,
      sessionName: conversation.sessionName,
      conversationId: conversation.id,
      email: email.trim(),
      heightCm: h,
    });

    if (!triggerResp) {
      setError('Analysis request failed. Please try again.');
      setStep('input');
      return;
    }

    // Store the picture_id — the modal stays in "running" state
    // until the WebSocket `strukturanalyse.complete` event arrives
    setPictureId(triggerResp.picture_id);
  }, [email, heightCm, message, conversation, triggerAnalysis]);

  const handleSendToLead = useCallback(async () => {
    if (!result) return;

    const success = await sendImage({
      runId: result.run_id,
      sessionName: conversation.sessionName,
      toJid: conversation.leadPhoneNumber,
      conversationId: conversation.id,
      caption: 'Strukturanalyse',
    });

    if (success) {
      setSendSuccess(true);
      setTimeout(onClose, 1500);
    }
  }, [result, conversation, sendImage, onClose]);

  // Build a preview URL for the source image
  const imagePreviewUrl = message.mediaUrl ?? '';

  return (
    <StyledOverlay onClick={onClose}>
      <StyledModal onClick={(e) => e.stopPropagation()}>
        <StyledHeader>
          <StyledTitle>Strukturanalyse</StyledTitle>
          <StyledCloseButton onClick={onClose}>×</StyledCloseButton>
        </StyledHeader>

        {step === 'input' && (
          <>
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

              <StyledFieldGroup>
                <StyledLabel>Customer Email</StyledLabel>
                <StyledInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </StyledFieldGroup>

              <StyledFieldGroup>
                <StyledLabel>Height (cm)</StyledLabel>
                <StyledInput
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="175"
                  min="100"
                  max="250"
                  step="0.5"
                />
              </StyledFieldGroup>

              {error && <StyledError>{error}</StyledError>}
            </StyledBody>

            <StyledFooter>
              <StyledButton onClick={onClose}>Cancel</StyledButton>
              <StyledButton
                variant="primary"
                onClick={handleRun}
                disabled={!email.trim() || !heightCm.trim()}
              >
                Run Analysis
              </StyledButton>
            </StyledFooter>
          </>
        )}

        {step === 'running' && (
          <StyledBody>
            <StyledLoadingContainer>
              <StyledSpinner />
              <StyledLoadingText>
                Running Strukturanalyse... This may take a few minutes.
              </StyledLoadingText>
            </StyledLoadingContainer>
          </StyledBody>
        )}

        {step === 'result' && result && (
          <>
            <StyledBody>
              {sendSuccess && (
                <StyledSuccessBanner>
                  Image sent to {conversation.contactName || conversation.leadPhoneNumber}
                </StyledSuccessBanner>
              )}

              {result.annotated_image_b64 && (
                <StyledResultImage
                  src={`data:image/jpeg;base64,${result.annotated_image_b64}`}
                  alt="Strukturanalyse result"
                />
              )}

              {result.analysis_text && (
                <StyledAnalysisText>{result.analysis_text}</StyledAnalysisText>
              )}

              {result.error && <StyledError>{result.error}</StyledError>}
            </StyledBody>

            <StyledFooter>
              <StyledButton onClick={onClose}>Close</StyledButton>
              {result.annotated_image_b64 && !sendSuccess && (
                <StyledButton variant="success" onClick={handleSendToLead}>
                  Send to Lead
                </StyledButton>
              )}
            </StyledFooter>
          </>
        )}
      </StyledModal>
    </StyledOverlay>
  );
};

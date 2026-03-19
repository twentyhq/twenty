import styled from '@emotion/styled';

import { IconSparkles, IconX } from 'twenty-ui/display';
import { SalesAngelPanel } from '@/whatsapp-chat/components/SalesAngelPanel';

// ── Styled Components ────────────────────────────────────────────

const StyledPanel = styled.div`
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  box-shadow: -4px 0 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100%;
  min-width: 400px;
  overflow: hidden;
  width: 400px;
`;

const StyledHeader = styled.div`
  align-items: center;
  background: #faf5ff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
`;

const StyledHeaderContent = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
`;

const StyledHeaderIcon = styled.div`
  align-items: center;
  background: #ede9fe;
  border-radius: 10px;
  display: flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  width: 40px;
`;

const StyledTitle = styled.h3`
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
`;

const StyledSubtitle = styled.p`
  color: #6b7280;
  font-size: 12px;
  margin: 2px 0 0;
`;

const StyledCloseButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: 4px;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 4px;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const StyledIntro = styled.div`
  background: #faf5ff;
  border-bottom: 1px solid #ede9fe;
  padding: 12px 16px;
`;

const StyledIntroText = styled.p`
  color: #6b21a8;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
`;

const StyledPanelWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

// ── Props ────────────────────────────────────────────────────────

type SalesAngelSidePanelProps = {
  onClose: () => void;
  conversationId: string | null;
  phoneNumber: string | null;
  onCopyToChat?: (message: string) => void;
};

// ── Component ────────────────────────────────────────────────────

export const SalesAngelSidePanel = ({
  onClose,
  conversationId,
  phoneNumber,
  onCopyToChat,
}: SalesAngelSidePanelProps) => {
  return (
    <StyledPanel>
      {/* Header */}
      <StyledHeader>
        <StyledHeaderContent>
          <StyledHeaderIcon>
            <IconSparkles size={20} color="#8b5cf6" />
          </StyledHeaderIcon>
          <div>
            <StyledTitle>Sales Angel</StyledTitle>
            <StyledSubtitle>AI-powered sales assistant</StyledSubtitle>
          </div>
        </StyledHeaderContent>
        <StyledCloseButton onClick={onClose}>
          <IconX size={20} />
        </StyledCloseButton>
      </StyledHeader>

      {/* Content */}
      <StyledContent>
        <StyledIntro>
          <StyledIntroText>
            Your AI assistant with access to conversation history, lead profile,
            and sales knowledge. Ask for message suggestions, pain point
            analysis, or next steps.
          </StyledIntroText>
        </StyledIntro>

        <StyledPanelWrapper>
          <SalesAngelPanel
            conversationId={conversationId}
            phoneNumber={phoneNumber}
            onCopyToChat={onCopyToChat}
          />
        </StyledPanelWrapper>
      </StyledContent>
    </StyledPanel>
  );
};

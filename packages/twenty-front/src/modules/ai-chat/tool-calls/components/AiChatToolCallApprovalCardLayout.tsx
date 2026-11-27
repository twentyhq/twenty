import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatToolCallApprovalCardHeader } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalCardHeader';
import { StyledAiChatAskCard } from '@/ai-chat/tool-calls/components/StyledAiChatAskCard';
import { StyledAiChatToolCallApprovalCardBody } from '@/ai-chat/tool-calls/components/StyledAiChatToolCallApprovalCardBody';
import { useAiChatAskCardFieldFocus } from '@/ai-chat/tool-calls/hooks/useAiChatAskCardFieldFocus';

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

type AiChatToolCallApprovalCardLayoutProps = {
  title: string;
  Icon?: IconComponent;
  summary?: string;
  actions: ReactNode;
  children: ReactNode;
};

export const AiChatToolCallApprovalCardLayout = ({
  title,
  Icon,
  summary,
  actions,
  children,
}: AiChatToolCallApprovalCardLayoutProps) => {
  const { handleFieldFocus, handleFieldBlur } = useAiChatAskCardFieldFocus();

  return (
    <StyledAiChatAskCard isPadded data-blocking-tool-card>
      <AiChatToolCallApprovalCardHeader
        title={title}
        Icon={Icon}
        summary={summary}
      />
      <StyledAiChatToolCallApprovalCardBody
        onFocus={handleFieldFocus}
        onBlur={handleFieldBlur}
      >
        {children}
      </StyledAiChatToolCallApprovalCardBody>
      <StyledActions>{actions}</StyledActions>
    </StyledAiChatAskCard>
  );
};

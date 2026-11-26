import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { LightButton } from 'twenty-ui/components/input';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatToolCallApprovalCardHeader } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalCardHeader';
import { AiChatToolCallApprovalFeedbackInput } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalFeedbackInput';
import { StyledAiChatAskCard } from '@/ai-chat/tool-calls/components/StyledAiChatAskCard';
import { StyledAiChatToolCallApprovalCardBody } from '@/ai-chat/tool-calls/components/StyledAiChatToolCallApprovalCardBody';
import { useAiChatAskCardFieldFocus } from '@/ai-chat/tool-calls/hooks/useAiChatAskCardFieldFocus';
import { type useAnswerToolCallApproval } from '@/ai-chat/tool-calls/hooks/useAnswerToolCallApproval';

const StyledActions = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledActionsSpacer = styled.div`
  flex: 1;
`;

type AiChatToolCallApprovalCardLayoutProps = {
  title: string;
  Icon?: IconComponent;
  summary?: string;
  approval: ReturnType<typeof useAnswerToolCallApproval>;
  actions: ReactNode;
  children: ReactNode;
};

export const AiChatToolCallApprovalCardLayout = ({
  title,
  Icon,
  summary,
  approval,
  actions,
  children,
}: AiChatToolCallApprovalCardLayoutProps) => {
  const { t } = useLingui();
  const { handleFieldFocus, handleFieldBlur } = useAiChatAskCardFieldFocus();
  const { isAnswering, isFeedbackShown, showFeedback, feedback, setFeedback } =
    approval;

  return (
    <StyledAiChatAskCard>
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
        {isFeedbackShown && (
          <AiChatToolCallApprovalFeedbackInput
            value={feedback}
            disabled={isAnswering}
            onChange={setFeedback}
          />
        )}
      </StyledAiChatToolCallApprovalCardBody>
      <StyledActions>
        {!isFeedbackShown && (
          <LightButton disabled={isAnswering} onClick={showFeedback}>
            {t`Add feedback`}
          </LightButton>
        )}
        <StyledActionsSpacer />
        {actions}
      </StyledActions>
    </StyledAiChatAskCard>
  );
};

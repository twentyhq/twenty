import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { LightButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledAiChatAskCard } from '@/ai/components/AiChatAskStyledComponents';
import { TextWithChatReferences } from '@/ai/components/TextWithChatReferences';
import { AiChatToolCallApprovalFeedbackInput } from '@/ai/components/internal/AiChatToolCallApprovalFeedbackInput';
import { useAiChatAskCardFieldFocus } from '@/ai/hooks/useAiChatAskCardFieldFocus';
import { type useAnswerToolCallApproval } from '@/ai/hooks/useAnswerToolCallApproval';

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]} 0;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSummary = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

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
  label: string;
  summary: string;
  approval: ReturnType<typeof useAnswerToolCallApproval>;
  actions: ReactNode;
  children: ReactNode;
};

export const AiChatToolCallApprovalCardLayout = ({
  label,
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
      <StyledHeader>
        <StyledLabel>{label}</StyledLabel>
        <StyledSummary>
          <TextWithChatReferences text={summary} />
        </StyledSummary>
      </StyledHeader>
      <StyledBody onFocus={handleFieldFocus} onBlur={handleFieldBlur}>
        {children}
        {isFeedbackShown && (
          <AiChatToolCallApprovalFeedbackInput
            value={feedback}
            disabled={isAnswering}
            onChange={setFeedback}
          />
        )}
      </StyledBody>
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

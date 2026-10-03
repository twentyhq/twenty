import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import TextareaAutosize from 'react-textarea-autosize';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFeedbackTextarea = styled(TextareaAutosize)`
  background: transparent;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  outline: none;
  padding: ${themeCssVariables.spacing[2]};
  resize: none;
`;

type AiChatToolCallApprovalFeedbackInputProps = {
  value: string;
  disabled: boolean;
  onChange: (feedback: string) => void;
};

export const AiChatToolCallApprovalFeedbackInput = ({
  value,
  disabled,
  onChange,
}: AiChatToolCallApprovalFeedbackInputProps) => {
  const { t } = useLingui();

  return (
    <StyledFeedbackTextarea
      aria-label={t`Feedback`}
      placeholder={t`Tell the agent what to change`}
      minRows={2}
      maxRows={8}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

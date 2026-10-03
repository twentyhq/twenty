import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { themeCssVariables } from 'twenty-ui/theme';

import { parseAndValidateVariableFriendlyStringifiedJson } from '@/workflow/utils/parseAndValidateVariableFriendlyStringifiedJson';

const StyledTextarea = styled(TextareaAutosize)`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  outline: none;
  padding: ${themeCssVariables.spacing[2]};
  resize: none;

  &:focus-visible {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledError = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.sm};
`;

type AiChatToolCallApprovalArgumentsEditorProps = {
  defaultArguments: Record<string, unknown>;
  readonly: boolean;
  onChange: (toolArguments: Record<string, unknown> | null) => void;
};

// tools without a dedicated card are edited as their raw arguments
export const AiChatToolCallApprovalArgumentsEditor = ({
  defaultArguments,
  readonly,
  onChange,
}: AiChatToolCallApprovalArgumentsEditorProps) => {
  const { t } = useLingui();
  const [text, setText] = useState(() =>
    JSON.stringify(defaultArguments, null, 2),
  );
  const [hasError, setHasError] = useState(false);

  const handleChange = (nextText: string) => {
    setText(nextText);

    const parsedArguments =
      parseAndValidateVariableFriendlyStringifiedJson(nextText);

    setHasError(!parsedArguments.isValid);
    onChange(parsedArguments.isValid ? parsedArguments.data : null);
  };

  return (
    <>
      <StyledTextarea
        aria-label={t`Arguments`}
        minRows={3}
        maxRows={16}
        spellCheck={false}
        value={text}
        disabled={readonly}
        onChange={(event) => handleChange(event.target.value)}
      />
      {hasError && (
        <StyledError role="alert">
          {t`Arguments must be a valid JSON object.`}
        </StyledError>
      )}
    </>
  );
};

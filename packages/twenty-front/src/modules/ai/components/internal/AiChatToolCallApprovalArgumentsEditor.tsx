import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { isPlainObject } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

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

    try {
      const parsedArguments: unknown = JSON.parse(nextText);
      const isValid = isPlainObject(parsedArguments);

      setHasError(!isValid);
      onChange(isValid ? parsedArguments : null);
    } catch {
      setHasError(true);
      onChange(null);
    }
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
        <StyledError>{t`Arguments must be a valid JSON object.`}</StyledError>
      )}
    </>
  );
};

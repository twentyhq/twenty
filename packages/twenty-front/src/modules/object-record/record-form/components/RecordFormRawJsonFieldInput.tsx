import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useId, useState } from 'react';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

const StyledTextArea = styled.textarea`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin: 0;
  min-height: ${themeCssVariables.spacing[20]};
  outline: none;
  padding: ${themeCssVariables.spacing[2]};
  resize: vertical;
  width: 100%;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  &:disabled {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

type RecordFormRawJsonFieldInputProps = {
  label?: string;
  defaultValue?: string | null;
  onChange: (value: string | null) => void;
  readonly?: boolean;
  placeholder?: string;
};

export const RecordFormRawJsonFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  placeholder,
}: RecordFormRawJsonFieldInputProps) => {
  const instanceId = useId();
  const [text, setText] = useState(defaultValue ?? '');

  const handleChange = (newText: string) => {
    setText(newText);

    const meaningfulText = turnIntoEmptyStringIfWhitespacesOnly(newText);

    onChange(meaningfulText === '' ? null : meaningfulText);
  };

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label htmlFor={instanceId}>{label}</Field.Label> : null}

      <FormFieldInputRowContainer multiline>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={false}
          multiline
        >
          <StyledTextArea
            id={instanceId}
            value={text}
            placeholder={placeholder ?? t`Enter a JSON object`}
            onChange={(event) => handleChange(event.target.value)}
            disabled={readonly}
          />
        </FormFieldInputInnerContainer>
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};

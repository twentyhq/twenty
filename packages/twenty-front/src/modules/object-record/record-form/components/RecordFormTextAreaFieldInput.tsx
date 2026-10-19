import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { t } from '@lingui/core/macro';
import { Field, Textarea } from 'twenty-ui/primitives/input';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type RecordFormTextAreaFieldInputProps = {
  label: string;
  defaultValue?: string;
  maxRows: number;
  placeholder?: string;
  readonly?: boolean;
  onChange: (value: string) => void;
};

export const RecordFormTextAreaFieldInput = ({
  label,
  defaultValue,
  maxRows,
  placeholder,
  readonly,
  onChange,
}: RecordFormTextAreaFieldInputProps) => (
  <FormFieldInputContainer>
    <Field.Label>{label}</Field.Label>
    <Textarea
      autoResize
      rows={2}
      maxRows={maxRows}
      defaultValue={defaultValue}
      placeholder={placeholder ?? t`Enter text`}
      disabled={readonly}
      onChange={(event) =>
        onChange(turnIntoEmptyStringIfWhitespacesOnly(event.target.value))
      }
    />
  </FormFieldInputContainer>
);

import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { Field, Textarea } from 'twenty-ui/primitives/input';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

type RecordFormTextAreaFieldInputProps = {
  label?: string;
  defaultValue?: string | null;
  placeholder?: string;
  onChange: (value: string) => void;
};

export const RecordFormTextAreaFieldInput = ({
  label,
  defaultValue,
  placeholder,
  onChange,
}: RecordFormTextAreaFieldInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? (
        <Field.Label htmlFor={instanceId}>{label}</Field.Label>
      ) : null}
      <Textarea
        id={instanceId}
        autoResize
        rows={2}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder ?? t`Enter text`}
        onChange={(event) =>
          onChange(turnIntoEmptyStringIfWhitespacesOnly(event.target.value))
        }
      />
    </FormFieldInputContainer>
  );
};

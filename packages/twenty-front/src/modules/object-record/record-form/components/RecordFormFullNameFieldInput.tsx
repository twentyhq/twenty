import { addCharactersToAvoidPasswordManagers } from '@/object-record/record-field/ui/meta-types/input/utils/addCharactersToAvoidPasswordManagers';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FullNameInput } from '@/ui/field/input/components/FullNameInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { Field } from 'twenty-ui/primitives/input';

type RecordFormFullNameFieldInputProps = {
  label?: string;
  defaultValue?: FieldFullNameValue;
  onChange: (value: FieldFullNameValue) => void;
  readonly?: boolean;
  subFieldPlaceholders?: Partial<Record<keyof FieldFullNameValue, string>>;
};

export const RecordFormFullNameFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  subFieldPlaceholders,
}: RecordFormFullNameFieldInputProps) => {
  const instanceId = useId();

  const firstNamePlaceholder = subFieldPlaceholders?.firstName ?? t`First name`;
  const lastNamePlaceholder = subFieldPlaceholders?.lastName ?? t`Last name`;

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? (
        <Field.Label htmlFor={instanceId}>{label}</Field.Label>
      ) : null}
      <FullNameInput
        instanceId={instanceId}
        inputId={instanceId}
        variant="inline"
        value={defaultValue}
        placeholder={addCharactersToAvoidPasswordManagers(
          `${firstNamePlaceholder} ${lastNamePlaceholder}`,
        )}
        firstNamePlaceholder={addCharactersToAvoidPasswordManagers(
          firstNamePlaceholder,
        )}
        lastNamePlaceholder={addCharactersToAvoidPasswordManagers(
          lastNamePlaceholder,
        )}
        onChange={onChange}
        disabled={readonly}
      />
    </FormFieldInputContainer>
  );
};

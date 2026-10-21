import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { addCharactersToAvoidPasswordManagers } from '@/object-record/record-field/ui/meta-types/input/utils/addCharactersToAvoidPasswordManagers';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RecordFormTextInput } from '@/object-record/record-form/components/RecordFormTextInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { t } from '@lingui/core/macro';
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
  const firstName = defaultValue?.firstName ?? '';
  const lastName = defaultValue?.lastName ?? '';

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <FormNestedFieldInputContainer>
        <RecordFormTextInput
          label={t`First Name`}
          value={firstName}
          onChange={(newFirstName) =>
            onChange({ firstName: newFirstName, lastName })
          }
          placeholder={addCharactersToAvoidPasswordManagers(
            subFieldPlaceholders?.firstName ?? t`First name`,
          )}
          readonly={readonly}
        />
        <RecordFormTextInput
          label={t`Last Name`}
          value={lastName}
          onChange={(newLastName) =>
            onChange({ firstName, lastName: newLastName })
          }
          placeholder={addCharactersToAvoidPasswordManagers(
            subFieldPlaceholders?.lastName ?? t`Last name`,
          )}
          readonly={readonly}
        />
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};

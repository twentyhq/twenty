import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { StyledFormCompositeFieldInputContainer } from '@/object-record/record-field/form-types/components/StyledFormCompositeFieldInputContainer';
import { StyledFormFieldInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputContainer';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { FIRST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS } from '@/object-record/record-field/meta-types/input/constants/FirstNamePlaceholder';
import { LAST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS } from '@/object-record/record-field/meta-types/input/constants/LastNamePlaceholder';
import { FieldFullNameValue } from '@/object-record/record-field/types/FieldMetadata';
import { InputLabel } from '@/ui/input/components/InputLabel';

type FormFullNameFieldInputProps = {
  label?: string;
  defaultValue: FieldFullNameValue | undefined;
  onPersist: (value: FieldFullNameValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormFullNameFieldInput = ({
  label,
  defaultValue,
  onPersist,
  readonly,
  VariablePicker,
}: FormFullNameFieldInputProps) => {
  const handleFirstNameChange = (newText: string) => {
    onPersist({
      lastName: defaultValue?.lastName ?? '',
      firstName: newText,
    });
  };

  const handleLastNameChange = (newText: string) => {
    onPersist({
      firstName: defaultValue?.firstName ?? '',
      lastName: newText,
    });
  };

  return (
    <StyledFormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}
      <StyledFormCompositeFieldInputContainer>
        <FormTextFieldInput
          label="First Name"
          defaultValue={defaultValue?.firstName}
          onPersist={handleFirstNameChange}
          placeholder={
            FIRST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS
          }
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
        <FormTextFieldInput
          label="Last Name"
          defaultValue={defaultValue?.lastName}
          onPersist={handleLastNameChange}
          placeholder={
            LAST_NAME_PLACEHOLDER_WITH_SPECIAL_CHARACTER_TO_AVOID_PASSWORD_MANAGERS
          }
          readonly={readonly}
          VariablePicker={VariablePicker}
        />
      </StyledFormCompositeFieldInputContainer>
    </StyledFormFieldInputContainer>
  );
};

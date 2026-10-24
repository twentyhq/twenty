import { addCharactersToAvoidPasswordManagers } from '@/object-record/record-field/ui/meta-types/input/utils/addCharactersToAvoidPasswordManagers';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldInputDetailsToggleRow } from '@/ui/field/input/components/FieldInputDetailsToggleRow';
import { StyledRecordFormFieldBox } from '@/object-record/record-form/components/StyledRecordFormFieldBox';
import { StyledFieldInputDetails } from '@/ui/field/input/components/StyledFieldInputDetails';
import { joinFullName } from '@/object-record/record-field/ui/meta-types/input/utils/joinFullName';
import { trimFullName } from '@/object-record/record-field/ui/meta-types/input/utils/trimFullName';
import { splitFullNameInputText } from '@/object-record/record-field/ui/meta-types/input/utils/splitFullNameInputText';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { TextInput } from '@/ui/input/components/TextInput';
import { PASSWORD_MANAGER_IGNORE_ATTRIBUTES } from '@/ui/input/constants/PasswordManagerIgnoreAttributes';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { Field } from 'twenty-ui/primitives/input';

type RecordFormFullNameFieldInputProps = {
  label?: string;
  defaultValue?: FieldFullNameValue;
  firstNamePlaceholder?: string;
  lastNamePlaceholder?: string;
  onChange: (value: FieldFullNameValue) => void;
};

export const RecordFormFullNameFieldInput = ({
  label,
  defaultValue,
  firstNamePlaceholder,
  lastNamePlaceholder,
  onChange,
}: RecordFormFullNameFieldInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();

  const [fullName, setFullName] = useState<FieldFullNameValue>({
    firstName: defaultValue?.firstName ?? '',
    lastName: defaultValue?.lastName ?? '',
  });
  const [fullNameText, setFullNameText] = useState(() =>
    joinFullName(fullName),
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const firstNameText = firstNamePlaceholder ?? t`First name`;
  const lastNameText = lastNamePlaceholder ?? t`Last name`;

  const updateFullName = (nextFullName: FieldFullNameValue) => {
    setFullName(nextFullName);
    onChange(trimFullName(nextFullName));
  };

  const handleFullNameTextChange = (text: string) => {
    setFullNameText(text);
    updateFullName(splitFullNameInputText({ text, currentFullName: fullName }));
  };

  const handleNamePartChange = (nextFullName: FieldFullNameValue) => {
    setFullNameText(joinFullName(nextFullName));
    updateFullName(nextFullName);
  };

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? (
        <Field.Label htmlFor={instanceId}>{label}</Field.Label>
      ) : null}
      <StyledRecordFormFieldBox>
        <FieldInputDetailsToggleRow
          isExpanded={isExpanded}
          toggleLabel={t`Name details`}
          onToggle={() => setIsExpanded(!isExpanded)}
        >
          <StyledTextInput
            id={instanceId}
            autoComplete="off"
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...PASSWORD_MANAGER_IGNORE_ATTRIBUTES}
            placeholder={addCharactersToAvoidPasswordManagers(
              `${firstNameText} ${lastNameText}`,
            )}
            value={fullNameText}
            onChange={(event) => handleFullNameTextChange(event.target.value)}
          />
        </FieldInputDetailsToggleRow>
        {isExpanded && (
          <StyledFieldInputDetails>
            <TextInput
              label={t`First name`}
              value={fullName.firstName}
              placeholder={addCharactersToAvoidPasswordManagers(firstNameText)}
              fullWidth
              ignorePasswordManagers
              onChange={(firstName) =>
                handleNamePartChange({ ...fullName, firstName })
              }
            />
            <TextInput
              label={t`Last name`}
              value={fullName.lastName}
              placeholder={addCharactersToAvoidPasswordManagers(lastNameText)}
              fullWidth
              ignorePasswordManagers
              onChange={(lastName) =>
                handleNamePartChange({ ...fullName, lastName })
              }
            />
          </StyledFieldInputDetails>
        )}
      </StyledRecordFormFieldBox>
    </FormFieldInputContainer>
  );
};

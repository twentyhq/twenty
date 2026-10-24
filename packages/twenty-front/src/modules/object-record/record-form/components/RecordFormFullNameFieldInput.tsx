import { addCharactersToAvoidPasswordManagers } from '@/object-record/record-field/ui/meta-types/input/utils/addCharactersToAvoidPasswordManagers';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { StyledRecordFormFieldBox } from '@/object-record/record-form/components/StyledRecordFormFieldBox';
import { splitFullNameInputText } from '@/object-record/record-form/utils/splitFullNameInputText';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { TextInput } from '@/ui/input/components/TextInput';
import { PASSWORD_MANAGER_IGNORE_ATTRIBUTES } from '@/ui/input/constants/PasswordManagerIgnoreAttributes';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconListDetails } from 'twenty-ui/icon';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFullNameRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  padding-right: ${themeCssVariables.spacing[1]};
`;

const StyledNameDetails = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
  padding: ${themeCssVariables.spacing[2]};
`;

const joinFullName = ({ firstName, lastName }: FieldFullNameValue) =>
  `${firstName} ${lastName}`.trim();

const trimFullName = ({
  firstName,
  lastName,
}: FieldFullNameValue): FieldFullNameValue => ({
  firstName: firstName.trim(),
  lastName: lastName.trim(),
});

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

  const [fullName, setFullName] = useState<FieldFullNameValue>(
    defaultValue ?? { firstName: '', lastName: '' },
  );
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
        <StyledFullNameRow>
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
          <LightIconButton
            aria-label={t`Name details`}
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <IconListDetails />
          </LightIconButton>
        </StyledFullNameRow>
        {isExpanded && (
          <StyledNameDetails>
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
          </StyledNameDetails>
        )}
      </StyledRecordFormFieldBox>
    </FormFieldInputContainer>
  );
};

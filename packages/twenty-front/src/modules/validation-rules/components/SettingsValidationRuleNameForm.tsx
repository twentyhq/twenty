import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme';

import { IconPicker } from '@/ui/input/components/IconPicker';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNameRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

type SettingsValidationRuleNameFormProps = {
  values: ValidationRuleFormValues;
  onChange: (values: ValidationRuleFormValues) => void;
};

export const SettingsValidationRuleNameForm = ({
  values,
  onChange,
}: SettingsValidationRuleNameFormProps) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <StyledNameRow>
        <IconPicker
          dropdownId="validation-rule-icon"
          selectedIconKey={values.icon}
          onChange={({ iconKey }) => onChange({ ...values, icon: iconKey })}
          variant="outline"
        />
        <SettingsTextInput
          instanceId="validation-rule-name"
          placeholder={t`Customer deals need an amount`}
          value={values.name}
          onChange={(name) => onChange({ ...values, name })}
          fullWidth
        />
      </StyledNameRow>
      <TextArea
        textAreaId="validation-rule-description"
        placeholder={t`Write a description`}
        minRows={2}
        maxRows={5}
        value={values.description ?? ''}
        onChange={(description) =>
          onChange({
            ...values,
            description: isNonEmptyString(description) ? description : null,
          })
        }
      />
    </StyledContainer>
  );
};

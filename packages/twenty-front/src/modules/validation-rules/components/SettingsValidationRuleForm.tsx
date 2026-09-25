import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { Section } from 'twenty-ui/components';
import { IconListCheck } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SettingsValidationRuleExpressionEditor } from '@/validation-rules/components/SettingsValidationRuleExpressionEditor';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';

const RECORD_LEVEL_OPTION_VALUE = 'record-level';

const StyledRow = styled.div`
  align-items: flex-end;
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr 1fr;
`;

type SettingsValidationRuleFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fields: ValidationRuleFieldDescriptor[];
  values: ValidationRuleFormValues;
  onChange: (values: ValidationRuleFormValues) => void;
};

export const SettingsValidationRuleForm = ({
  objectMetadataItem,
  fields,
  values,
  onChange,
}: SettingsValidationRuleFormProps) => {
  const { t } = useLingui();

  const errorFieldOptions = [
    { label: t`Whole record`, value: RECORD_LEVEL_OPTION_VALUE },
    ...objectMetadataItem.fields
      .filter((field) => field.isActive && field.isSystem !== true)
      .map((field) => ({ label: field.label, value: field.id })),
  ];

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Condition`}
          description={t`Must be true to save. A write that makes it false is rejected.`}
        />
        <SettingsValidationRuleExpressionEditor
          value={values.expression}
          fields={fields}
          onChange={(expression) => onChange({ ...values, expression })}
        />
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Error`}
          description={t`What people see when the condition is false, and where it shows.`}
        />
        <StyledRow>
          <SettingsTextInput
            instanceId="validation-rule-message"
            label={t`Message`}
            placeholder={t`A won opportunity needs an amount`}
            value={values.message}
            onChange={(message) => onChange({ ...values, message })}
            fullWidth
          />
          <Select
            dropdownId="validation-rule-error-field"
            label={t`Show on`}
            fullWidth
            value={values.errorFieldMetadataId ?? RECORD_LEVEL_OPTION_VALUE}
            options={errorFieldOptions}
            onChange={(value) =>
              onChange({
                ...values,
                errorFieldMetadataId:
                  value === RECORD_LEVEL_OPTION_VALUE ? null : value,
              })
            }
          />
        </StyledRow>
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Status`}
          description={t`An inactive rule is kept but not enforced.`}
        />
        <Card rounded>
          <SettingsOptionCardContentSwitch
            Icon={IconListCheck}
            title={t`Active`}
            description={t`Check every write against this rule.`}
            checked={values.isActive}
            onChange={(isActive) => onChange({ ...values, isActive })}
          />
        </Card>
      </Section.Root>
    </>
  );
};

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { Section } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SettingsValidationRuleExpressionEditor } from '@/validation-rules/components/SettingsValidationRuleExpressionEditor';
import { SettingsValidationRuleNameForm } from '@/validation-rules/components/SettingsValidationRuleNameForm';
import { SettingsValidationRulePreview } from '@/validation-rules/components/SettingsValidationRulePreview';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';

const RECORD_LEVEL_OPTION_VALUE = 'record-level';

const StyledConditionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledRow = styled.div`
  align-items: flex-end;
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr 1fr;
`;

type SettingsValidationRuleFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fields: ValidationRuleFieldDescriptor[];
  editorFields: ValidationRuleEditorField[];
  values: ValidationRuleFormValues;
  onChange: (values: ValidationRuleFormValues) => void;
};

export const SettingsValidationRuleForm = ({
  objectMetadataItem,
  fields,
  editorFields,
  values,
  onChange,
}: SettingsValidationRuleFormProps) => {
  const { t } = useLingui();

  const errorFieldOptions = [
    { label: t`Whole record`, value: RECORD_LEVEL_OPTION_VALUE },
    ...objectMetadataItem.fields
      .filter((field) => field.isActive && !field.isSystem)
      .map((field) => ({ label: field.label, value: field.id })),
  ];

  return (
    <>
      <Section.Root>
        <Section.Header
          title={t`Name and description`}
          description={t`How this rule appears in settings.`}
        />
        <SettingsValidationRuleNameForm values={values} onChange={onChange} />
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Condition`}
          description={t`Must be true to save. A write that makes it false is rejected.`}
        />
        <StyledConditionContent>
          <SettingsValidationRulePreview
            objectMetadataItem={objectMetadataItem}
            fields={fields}
            editorFields={editorFields}
            expression={values.expression}
            message={values.message}
          />
          <SettingsValidationRuleExpressionEditor
            value={values.expression}
            fields={fields}
            editorFields={editorFields}
            onChange={(expression) => onChange({ ...values, expression })}
          />
        </StyledConditionContent>
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
    </>
  );
};

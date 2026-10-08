import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { Section } from 'twenty-ui/components/layout';
import { IconAddressBook, useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SettingsValidationRuleExpressionEditor } from '@/validation-rules/components/SettingsValidationRuleExpressionEditor';
import { SettingsValidationRuleFormFillEffect } from '@/validation-rules/components/SettingsValidationRuleFormFillEffect';
import { SettingsValidationRuleNameForm } from '@/validation-rules/components/SettingsValidationRuleNameForm';
import { SettingsValidationRulePreview } from '@/validation-rules/components/SettingsValidationRulePreview';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleFormFill } from '@/validation-rules/types/ValidationRuleFormFill';
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
  const { getIcon } = useIcons();
  const [expressionEditorKey, setExpressionEditorKey] = useState(0);

  const handleFill = ({
    name,
    expression,
    message,
    errorFieldMetadataId,
  }: ValidationRuleFormFill) => {
    onChange({ ...values, name, expression, message, errorFieldMetadataId });
    setExpressionEditorKey((previousKey) => previousKey + 1);
  };

  const errorFieldOptions = [
    {
      label: t`Whole record`,
      value: RECORD_LEVEL_OPTION_VALUE,
      Icon: IconAddressBook,
    },
    ...objectMetadataItem.fields
      .filter(
        (field) =>
          !field.isSystem &&
          (field.isActive || field.id === values.errorFieldMetadataId),
      )
      .map((field) => ({
        label: field.label,
        value: field.id,
        Icon: getIcon(field.icon),
        contextualText: field.isActive ? undefined : t`Deactivated`,
      })),
  ];

  return (
    <>
      <SettingsValidationRuleFormFillEffect onFill={handleFill} />
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
        <SettingsDataModelPreviewFormCard
          isPreviewTitleVisible={false}
          preview={
            <SettingsValidationRulePreview
              objectMetadataItem={objectMetadataItem}
              fields={fields}
              editorFields={editorFields}
              expression={values.expression}
              message={values.message}
            />
          }
          form={
            <SettingsValidationRuleExpressionEditor
              key={expressionEditorKey}
              value={values.expression}
              fields={fields}
              editorFields={editorFields}
              onChange={(expression) => onChange({ ...values, expression })}
            />
          }
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
    </>
  );
};

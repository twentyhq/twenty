import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsValidationRuleForm } from '@/validation-rules/components/SettingsValidationRuleForm';
import { SettingsValidationRulePageLayout } from '@/validation-rules/components/SettingsValidationRulePageLayout';
import { VALIDATION_RULE_DEFAULT_ICON } from '@/validation-rules/constants/ValidationRuleDefaultIcon';
import { useNavigateToObjectValidationRules } from '@/validation-rules/hooks/useNavigateToObjectValidationRules';
import { useValidationRuleMutations } from '@/validation-rules/hooks/useValidationRuleMutations';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';
import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { getValidationRuleSaveErrorMessage } from '@/validation-rules/utils/getValidationRuleSaveErrorMessage';
import { isValidationRuleFormSubmittable } from '@/validation-rules/utils/isValidationRuleFormSubmittable';

type SettingsValidationRuleCreateFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const SettingsValidationRuleCreateForm = ({
  objectMetadataItem,
}: SettingsValidationRuleCreateFormProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { objectMetadataItems } = useObjectMetadataItems();
  const navigateToObjectValidationRules = useNavigateToObjectValidationRules({
    objectNamePlural: objectMetadataItem.namePlural,
  });
  const { createValidationRule, isSaving } = useValidationRuleMutations({
    objectMetadataId: objectMetadataItem.id,
  });

  const [values, setValues] = useState<ValidationRuleFormValues>({
    name: t`New rule`,
    description: null,
    icon: VALIDATION_RULE_DEFAULT_ICON,
    expression: '',
    message: '',
    errorFieldMetadataId: null,
  });

  const fields = buildValidationRuleFieldDescriptors({
    objectMetadataItem,
    objectMetadataItems,
  });
  const editorFields = buildValidationRuleEditorFields({
    objectMetadataItem,
    objectMetadataItems,
  });

  const handleSave = async () => {
    try {
      await createValidationRule({
        variables: {
          input: {
            ...values,
            objectMetadataId: objectMetadataItem.id,
            isActive: true,
          },
        },
      });
      enqueueToast({ status: 'success', children: t`Rule activated.` });
      navigateToObjectValidationRules();
    } catch (error) {
      enqueueToast({
        status: 'error',
        children:
          getValidationRuleSaveErrorMessage(error) ??
          t`Failed to create the rule.`,
      });
    }
  };

  return (
    <SettingsValidationRulePageLayout
      objectMetadataItem={objectMetadataItem}
      breadcrumbLabel={t`New rule`}
      stepLabel={t`New rule`}
      saveLabel={t`Activate`}
      isSaveDisabled={
        isSaving || !isValidationRuleFormSubmittable({ values, fields })
      }
      onSave={handleSave}
    >
      <SettingsValidationRuleForm
        objectMetadataItem={objectMetadataItem}
        fields={fields}
        editorFields={editorFields}
        values={values}
        onChange={setValues}
      />
    </SettingsValidationRulePageLayout>
  );
};

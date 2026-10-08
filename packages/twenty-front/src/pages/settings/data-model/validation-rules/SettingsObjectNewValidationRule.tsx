import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsValidationRuleForm } from '@/validation-rules/components/SettingsValidationRuleForm';
import { SettingsValidationRulePageLayout } from '@/validation-rules/components/SettingsValidationRulePageLayout';
import { EMPTY_VALIDATION_RULE_FORM_VALUES } from '@/validation-rules/constants/EmptyValidationRuleFormValues';
import { useNavigateToObjectValidationRules } from '@/validation-rules/hooks/useNavigateToObjectValidationRules';
import { useValidationRuleMutations } from '@/validation-rules/hooks/useValidationRuleMutations';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';
import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { getValidationRuleSaveErrorMessage } from '@/validation-rules/utils/getValidationRuleSaveErrorMessage';
import { isValidationRuleFormSubmittable } from '@/validation-rules/utils/isValidationRuleFormSubmittable';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { NotFound } from '~/pages/not-found/NotFound';

const SettingsObjectNewValidationRuleForm = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { objectMetadataItems } = useObjectMetadataItems();
  const navigateToObjectValidationRules = useNavigateToObjectValidationRules({
    objectNamePlural: objectMetadataItem.namePlural,
  });
  const { createValidationRule, isSaving } = useValidationRuleMutations({
    objectMetadataId: objectMetadataItem.id,
  });

  const [values, setValues] = useState<ValidationRuleFormValues>(
    EMPTY_VALIDATION_RULE_FORM_VALUES,
  );

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
          input: { objectMetadataId: objectMetadataItem.id, ...values },
        },
      });
      enqueueToast({ variant: 'success', children: t`Rule created.` });
      navigateToObjectValidationRules();
    } catch (error) {
      enqueueToast({
        variant: 'error',
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
      stepLabel={t`Configure rule`}
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

export const SettingsObjectNewValidationRule = () => {
  const isValidationRulesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_VALIDATION_RULES_ENABLED,
  );
  const { objectNamePlural = '' } = useParams();
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  if (!isValidationRulesEnabled || !isDefined(objectMetadataItem)) {
    return <NotFound />;
  }

  return (
    <SettingsObjectNewValidationRuleForm
      objectMetadataItem={objectMetadataItem}
    />
  );
};

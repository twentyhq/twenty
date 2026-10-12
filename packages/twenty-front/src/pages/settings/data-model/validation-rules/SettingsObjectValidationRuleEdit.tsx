import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsValidationRuleEditForm } from '@/validation-rules/components/SettingsValidationRuleEditForm';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { NotFound } from '~/pages/not-found/NotFound';

export const SettingsObjectValidationRuleEdit = () => {
  const isValidationRulesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_VALIDATION_RULES_ENABLED,
  );
  const { objectNamePlural = '', validationRuleId = '' } = useParams();
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { validationRules, loading } = useValidationRules({
    objectMetadataId: objectMetadataItem?.id ?? '',
  });

  if (!isValidationRulesEnabled || !isDefined(objectMetadataItem)) {
    return <NotFound />;
  }

  const validationRule = validationRules.find(
    (candidate) => candidate.id === validationRuleId,
  );

  if (!isDefined(validationRule)) {
    return loading ? null : <NotFound />;
  }

  return (
    <SettingsValidationRuleEditForm
      key={validationRule.id}
      objectMetadataItem={objectMetadataItem}
      validationRule={validationRule}
    />
  );
};

import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsValidationRuleCreateForm } from '@/validation-rules/components/SettingsValidationRuleCreateForm';
import { useHasValidationRulesEntitlement } from '@/validation-rules/hooks/useHasValidationRulesEntitlement';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { NotFound } from '~/pages/not-found/NotFound';

export const SettingsObjectValidationRuleNew = () => {
  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );
  const hasValidationRulesEntitlement = useHasValidationRulesEntitlement();
  const { objectNamePlural = '' } = useParams();
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  if (
    !isRecordCreationFormEnabled ||
    !hasValidationRulesEntitlement ||
    !isDefined(objectMetadataItem)
  ) {
    return <NotFound />;
  }

  return (
    <SettingsValidationRuleCreateForm objectMetadataItem={objectMetadataItem} />
  );
};

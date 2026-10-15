import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useHasValidationRulesEntitlement } from '@/validation-rules/hooks/useHasValidationRulesEntitlement';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useValidationRuleSettingsObjectMetadataItem = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const isRecordCreationFormEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
  );
  const hasValidationRulesEntitlement = useHasValidationRulesEntitlement();
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  if (!isRecordCreationFormEnabled || !hasValidationRulesEntitlement) {
    return undefined;
  }

  return findObjectMetadataItemByNamePlural(objectNamePlural);
};

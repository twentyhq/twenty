import { useLingui } from '@lingui/react/macro';
import { FeatureFlagKey, type FieldMetadataType } from 'twenty-shared/types';
import { isFormulaFieldMetadataType } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsDataModelFieldFormulaForm } from '@/settings/data-model/fields/forms/formula/components/SettingsDataModelFieldFormulaForm';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type SettingsDataModelFieldFormulaSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldType: FieldMetadataType;
  existingFieldMetadataId?: string;
};

export const SettingsDataModelFieldFormulaSection = ({
  objectMetadataItem,
  fieldType,
  existingFieldMetadataId,
}: SettingsDataModelFieldFormulaSectionProps) => {
  const { t } = useLingui();
  const isFormulaFieldEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_FORMULA_FIELD_ENABLED,
  );

  if (!isFormulaFieldEnabled || !isFormulaFieldMetadataType(fieldType)) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Formula`}
        description={t`Compute this field from other fields. Leave empty to enter values by hand.`}
      />
      <SettingsDataModelFieldFormulaForm
        objectMetadataItem={objectMetadataItem}
        existingFieldMetadataId={existingFieldMetadataId}
      />
    </Section.Root>
  );
};

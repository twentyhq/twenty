import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';
import { isFormulaFieldMetadataType } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsDataModelFieldFormulaForm } from '@/settings/data-model/fields/forms/formula/components/SettingsDataModelFieldFormulaForm';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

const getFormulaSectionDescription = (fieldType: FieldMetadataType) => {
  if (fieldType === FieldMetadataType.SELECT) {
    return t`Compute this field from other fields. The formula must return one of the option values, in quotes. Leave empty to pick values by hand.`;
  }

  if (fieldType === FieldMetadataType.RATING) {
    return t`Compute this field from other fields. The formula must return a number from 1 to 5. Leave empty to rate by hand.`;
  }

  if (fieldType === FieldMetadataType.CURRENCY) {
    return t`Compute the amount from other fields, in micros: 1 unit is 1,000,000. Leave empty to enter values by hand.`;
  }

  return t`Compute this field from other fields. Leave empty to enter values by hand.`;
};

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
    <>
      <Section.Root>
        <Section.Header
          title={t`Formula`}
          description={getFormulaSectionDescription(fieldType)}
        />
        <SettingsDataModelFieldFormulaForm
          objectMetadataItem={objectMetadataItem}
          existingFieldMetadataId={existingFieldMetadataId}
          name="formula"
          ariaLabel={t`Formula`}
        />
      </Section.Root>
      {fieldType === FieldMetadataType.CURRENCY && (
        <Section.Root>
          <Section.Header
            title={t`Formula currency`}
            description={t`The currency of the computed amount: a code in quotes such as "USD", or the currency code of another field.`}
          />
          <SettingsDataModelFieldFormulaForm
            objectMetadataItem={objectMetadataItem}
            existingFieldMetadataId={existingFieldMetadataId}
            name="formulaCurrencyCode"
            ariaLabel={t`Formula currency`}
          />
        </Section.Root>
      )}
    </>
  );
};

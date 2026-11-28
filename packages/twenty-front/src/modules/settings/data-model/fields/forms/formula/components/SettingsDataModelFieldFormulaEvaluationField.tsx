import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { type FieldMetadataFormulaEvaluation } from 'twenty-shared/types';
import { Section } from 'twenty-ui/components/layout';
import { IconDatabase } from 'twenty-ui/icon';
import { Switch } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { type SettingsDataModelFieldFormulaFormValues } from '@/settings/data-model/fields/forms/formula/components/SettingsDataModelFieldFormulaForm';
import { buildFormulaFieldEditorInputs } from '@/settings/data-model/fields/forms/formula/utils/buildFormulaFieldEditorInputs';
import { getFormulaExpressionEvaluation } from '@/settings/data-model/fields/forms/formula/utils/getFormulaExpressionEvaluation';

type SettingsDataModelFieldFormulaEvaluationFieldProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  existingFieldMetadataId?: string;
};

export const SettingsDataModelFieldFormulaEvaluationField = ({
  objectMetadataItem,
  existingFieldMetadataId,
}: SettingsDataModelFieldFormulaEvaluationFieldProps) => {
  const { t } = useLingui();
  const { control, setValue, trigger } =
    useFormContext<SettingsDataModelFieldFormulaFormValues>();
  const [formula, formulaCurrencyCode, formulaEvaluation] = useWatch({
    control,
    name: ['formula', 'formulaCurrencyCode', 'formulaEvaluation'],
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const { fields } = useMemo(
    () =>
      buildFormulaFieldEditorInputs({
        objectMetadataItem,
        objectMetadataItems,
        fieldMetadataId: existingFieldMetadataId,
      }),
    [objectMetadataItem, objectMetadataItems, existingFieldMetadataId],
  );

  if (!isNonEmptyString(formula)) {
    return null;
  }

  const isAggregating = [formula, formulaCurrencyCode].some(
    (expression) =>
      getFormulaExpressionEvaluation({ expression, fields }) === 'STORED',
  );
  const isStored = isAggregating || formulaEvaluation === 'STORED';

  const getDescription = () => {
    if (isAggregating) {
      return t`Aggregates related records, so it is always stored and updated in the background`;
    }

    return isStored
      ? t`Updated in the background; other formulas can read it`
      : t`Computed on every read; other formulas cannot read it`;
  };

  const handleIsStoredChange = (shouldStore: boolean) => {
    const evaluation: FieldMetadataFormulaEvaluation = shouldStore
      ? 'STORED'
      : 'QUERY_TIME';

    setValue('formulaEvaluation', evaluation, { shouldDirty: true });
    void trigger(['formula', 'formulaCurrencyCode']);
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Computation`}
        description={t`When the value of this formula is computed`}
      />
      <Card.Root fullWidth>
        <SettingsOptionCardContentSelect
          Icon={IconDatabase}
          title={t`Store the value`}
          description={getDescription()}
        >
          <Switch
            aria-label={t`Store the value`}
            size="sm"
            checked={isStored}
            onCheckedChange={handleIsStoredChange}
            disabled={isAggregating}
          />
        </SettingsOptionCardContentSelect>
      </Card.Root>
    </Section.Root>
  );
};

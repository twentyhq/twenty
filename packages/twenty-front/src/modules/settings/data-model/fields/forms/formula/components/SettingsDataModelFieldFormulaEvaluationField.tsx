import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { type FieldMetadataFormulaEvaluation } from 'twenty-shared/types';
import { SegmentedControl } from 'twenty-ui/components/input';
import { Field } from 'twenty-ui/primitives/input';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
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
  const evaluation: FieldMetadataFormulaEvaluation = isAggregating
    ? 'STORED'
    : (formulaEvaluation ?? 'QUERY_TIME');

  const getDescription = () => {
    if (isAggregating) {
      return t`Reads related records, so it is stored and updated in the background a few seconds after they change. Other formulas can read it.`;
    }

    return evaluation === 'STORED'
      ? t`Updated in the background a few seconds after the fields it reads change. Other formulas can read it.`
      : t`Computed each time it is read. Other formulas cannot read it.`;
  };

  const handleEvaluationChange = (
    newEvaluation: FieldMetadataFormulaEvaluation,
  ) => {
    setValue('formulaEvaluation', newEvaluation, { shouldDirty: true });
    void trigger(['formula', 'formulaCurrencyCode']);
  };

  return (
    <Field.Root>
      <Field.Label>{t`Computed`}</Field.Label>
      <SegmentedControl
        aria-label={t`Computed`}
        variant="rectangle"
        itemWidth="content"
        options={[
          { value: 'QUERY_TIME', label: t`Live`, disabled: isAggregating },
          { value: 'STORED', label: t`Stored` },
        ]}
        value={evaluation}
        onValueChange={handleEvaluationChange}
      />
      <Field.Description>{getDescription()}</Field.Description>
    </Field.Root>
  );
};

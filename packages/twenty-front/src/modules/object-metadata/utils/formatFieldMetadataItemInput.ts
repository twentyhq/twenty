import { isNonEmptyString } from '@sniptt/guards';
import { type FieldMetadataFormulaEvaluation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const formatFieldMetadataItemInput = (
  input: Partial<
    Pick<
      FieldMetadataItem,
      | 'name'
      | 'label'
      | 'icon'
      | 'description'
      | 'defaultValue'
      | 'type'
      | 'options'
      | 'settings'
      | 'isLabelSyncedWithName'
      | 'isUnique'
    >
  > & {
    formula?: string;
    formulaCurrencyCode?: string;
    formulaEvaluation?: FieldMetadataFormulaEvaluation;
  },
) => {
  const formulaExpression = input.formula?.trim();
  const formulaCurrencyCodeExpression = input.formulaCurrencyCode?.trim();

  const formatFormula = () => {
    if (!isDefined(formulaExpression)) {
      return undefined;
    }

    if (!isNonEmptyString(formulaExpression)) {
      return null;
    }

    return {
      expression: formulaExpression,
      ...(isNonEmptyString(formulaCurrencyCodeExpression)
        ? { currencyCodeExpression: formulaCurrencyCodeExpression }
        : {}),
      ...(isDefined(input.formulaEvaluation)
        ? { evaluation: input.formulaEvaluation }
        : {}),
    };
  };

  return {
    defaultValue: input.defaultValue,
    description: input.description?.trim() ?? null,
    icon: input.icon,
    label: input.label?.trim(),
    name: input.name?.trim(),
    options: input.options,
    settings: input.settings,
    formula: formatFormula(),
    isLabelSyncedWithName: input.isLabelSyncedWithName,
    isUnique: input.isUnique,
  };
};

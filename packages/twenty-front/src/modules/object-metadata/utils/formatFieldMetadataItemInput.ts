import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isFormulaFieldMetadata } from 'twenty-shared/utils';

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
    existingSettings?: FieldMetadataItem['settings'];
  },
) => {
  const formulaExpression = input.formula?.trim();
  const formulaCurrencyCodeExpression = input.formulaCurrencyCode?.trim();
  // Some field type forms leave settings out, yet clearing their formula must keep the rest
  const settings = input.settings ?? input.existingSettings;

  const formatSettings = () => {
    if (!isDefined(formulaExpression)) {
      return input.settings;
    }

    if (!isNonEmptyString(formulaExpression)) {
      return isFormulaFieldMetadata({ settings })
        ? { ...settings, formula: null }
        : input.settings;
    }

    const formula = isNonEmptyString(formulaCurrencyCodeExpression)
      ? {
          expression: formulaExpression,
          currencyCodeExpression: formulaCurrencyCodeExpression,
        }
      : { expression: formulaExpression };

    return { ...settings, formula };
  };

  return {
    defaultValue: input.defaultValue,
    description: input.description?.trim() ?? null,
    icon: input.icon,
    label: input.label?.trim(),
    name: input.name?.trim(),
    options: input.options,
    settings: formatSettings(),
    isLabelSyncedWithName: input.isLabelSyncedWithName,
    isUnique: input.isUnique,
  };
};

import { isNonEmptyString } from '@sniptt/guards';
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
  > & { formula?: string; formulaCurrencyCode?: string },
) => {
  const formulaExpression = input.formula?.trim();
  const formulaCurrencyCodeExpression = input.formulaCurrencyCode?.trim();

  return {
    defaultValue: input.defaultValue,
    description: input.description?.trim() ?? null,
    icon: input.icon,
    label: input.label?.trim(),
    name: input.name?.trim(),
    options: input.options,
    settings: isDefined(formulaExpression)
      ? {
          ...input.settings,
          formula: isNonEmptyString(formulaExpression)
            ? {
                expression: formulaExpression,
                ...(isNonEmptyString(formulaCurrencyCodeExpression)
                  ? { currencyCodeExpression: formulaCurrencyCodeExpression }
                  : {}),
              }
            : null,
        }
      : input.settings,
    isLabelSyncedWithName: input.isLabelSyncedWithName,
    isUnique: input.isUnique,
  };
};

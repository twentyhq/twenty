import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isNonEmptyString } from '@sniptt/guards';
import { CurrencyCode } from 'twenty-shared/constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/formatNumber';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';

export const getFieldMetadataItemInitialValues = (
  fieldMetadataItem: FieldMetadataItem | undefined,
) => {
  if (fieldMetadataItem?.type !== FieldMetadataType.CURRENCY) {
    return {
      settings: fieldMetadataItem?.settings ?? undefined,
      defaultValue: fieldMetadataItem?.defaultValue ?? undefined,
    };
  }

  const settings = fieldMetadataItem.settings ?? {
    format: 'short',
    decimals: DEFAULT_DECIMAL_VALUE,
  };

  const currencyCode = isNonEmptyString(
    fieldMetadataItem.defaultValue?.currencyCode,
  )
    ? fieldMetadataItem.defaultValue?.currencyCode
    : applySimpleQuotesToString(CurrencyCode.USD);

  const defaultValue = {
    amountMicros: fieldMetadataItem.defaultValue?.amountMicros ?? null,
    currencyCode,
  };

  return { settings, defaultValue };
};

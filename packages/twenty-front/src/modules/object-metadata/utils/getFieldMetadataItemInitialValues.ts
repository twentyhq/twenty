import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isNonEmptyString } from '@sniptt/guards';
import { CurrencyCode } from 'twenty-shared/constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { DEFAULT_DECIMAL_VALUE } from '~/utils/format/formatNumber';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const getFieldMetadataItemInitialValues = (
  fieldMetadataItem: FieldMetadataItem | null | undefined,
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

  const defaultValue = fieldMetadataItem.defaultValue
    ? {
        amountMicros: fieldMetadataItem.defaultValue.amountMicros ?? null,
        currencyCode: isNonEmptyString(
          stripSimpleQuotesFromString(
            fieldMetadataItem.defaultValue.currencyCode,
          ),
        )
          ? fieldMetadataItem.defaultValue.currencyCode
          : applySimpleQuotesToString(CurrencyCode.USD),
      }
    : {
        amountMicros: null,
        currencyCode: applySimpleQuotesToString(CurrencyCode.USD),
      };

  return { settings, defaultValue };
};

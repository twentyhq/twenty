import { isNull, isUndefined } from '@sniptt/guards';

import { transformNumericField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-numeric-field.util';
import { transformTextField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-text-field.util';

export const transformCurrencyField = (
  value: {
    amountMicros?: number | string | null;
    currencyCode?: string | null;
  } | null,
): {
  amountMicros?: number | null;
  currencyCode?: string | null;
} | null => {
  if (isNull(value)) return null;

  return {
    amountMicros: isUndefined(value.amountMicros)
      ? undefined
      : transformNumericField(value.amountMicros),
    currencyCode: isUndefined(value.currencyCode)
      ? undefined
      : transformTextField(value.currencyCode),
  };
};

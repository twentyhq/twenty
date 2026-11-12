import { isPlainObject } from 'twenty-shared/utils';

import { REPLACEMENT_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-57/constants/replacement-currency-code.constant';
import { WITHDRAWN_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-57/constants/withdrawn-currency-code.constant';
import { replaceWithdrawnCurrencyCodeInFilterValue } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-filter-value.util';

export const replaceWithdrawnCurrencyCodeInJson = (json: unknown): unknown => {
  if (Array.isArray(json)) {
    return json.map(replaceWithdrawnCurrencyCodeInJson);
  }

  if (!isPlainObject(json)) {
    return json;
  }

  const replacedJson = Object.fromEntries(
    Object.entries(json).map(([key, value]) => [
      key,
      replaceWithdrawnCurrencyCodeInJson(value),
    ]),
  );

  if (
    json.subFieldName === 'currencyCode' ||
    json.compositeFieldSubFieldName === 'currencyCode'
  ) {
    return {
      ...replacedJson,
      value: replaceWithdrawnCurrencyCodeInFilterValue(json.value),
    };
  }

  return json.currencyCode === WITHDRAWN_CURRENCY_CODE
    ? { ...replacedJson, currencyCode: REPLACEMENT_CURRENCY_CODE }
    : replacedJson;
};

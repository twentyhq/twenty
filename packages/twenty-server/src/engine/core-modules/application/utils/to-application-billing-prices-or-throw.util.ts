import { msg } from '@lingui/core/macro';
import { isArray } from '@sniptt/guards';
import {
  type ApplicationBillingPrice,
  isApplicationBillingPrice,
} from 'twenty-shared/application';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const toApplicationBillingPricesOrThrow = (
  prices: unknown,
): ApplicationBillingPrice[] => {
  if (!isDefined(prices)) {
    return [];
  }

  const hasOnlyValidPrices =
    isArray(prices) &&
    prices.every(isApplicationBillingPrice) &&
    new Set(prices.map(({ universalIdentifier }) => universalIdentifier))
      .size === prices.length;

  if (!hasOnlyValidPrices) {
    throw new ApplicationException(
      doNotTranslate('Invalid or duplicated application billing prices'),
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`This application declares invalid prices`,
      },
    );
  }

  return prices;
};

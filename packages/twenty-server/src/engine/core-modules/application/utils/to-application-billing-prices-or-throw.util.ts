import { msg } from '@lingui/core/macro';
import { type ApplicationBillingPrice } from 'twenty-shared/application';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { areApplicationBillingPricesValid } from 'src/engine/core-modules/application/utils/are-application-billing-prices-valid.util';

export const toApplicationBillingPricesOrThrow = (
  prices: unknown,
): ApplicationBillingPrice[] => {
  if (!areApplicationBillingPricesValid(prices)) {
    throw new ApplicationException(
      doNotTranslate('Invalid or duplicated application billing prices'),
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`This application declares invalid prices`,
      },
    );
  }

  return isDefined(prices) ? prices : [];
};

import { type ApplicationBillingPrice } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { toApplicationBillingPricesOrThrow } from 'src/engine/core-modules/application/utils/to-application-billing-prices-or-throw.util';

export const resolveAcceptedBillingPricesOnInstallCompleted = ({
  previousVersion,
  manifestBilling,
}: {
  previousVersion: string | null | undefined;
  manifestBilling: { prices?: unknown } | undefined;
}): ApplicationBillingPrice[] | undefined =>
  isDefined(previousVersion)
    ? undefined
    : toApplicationBillingPricesOrThrow(manifestBilling?.prices);

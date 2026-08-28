/* @license Enterprise */

import {
  type ApplicationBilling,
  type RecurringCharge,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { buildRecurringChargeKey } from 'src/engine/core-modules/usage/utils/build-recurring-charge-key.util';

export type DueRecurringCharge = {
  applicationId: string;
  chargeKey: string;
  charge: RecurringCharge;
};

type CollectDueRecurringChargesParams = {
  flatApplicationMaps: FlatApplicationCacheMaps;
  alreadyChargedKeys: Set<string>;
};

// The recurring charges an installed application declares that this period does
// not already carry. Uninstalled applications are skipped so a removed app stops
// billing from the next period; the period it was removed in was already raised.
export const collectDueRecurringCharges = ({
  flatApplicationMaps,
  alreadyChargedKeys,
}: CollectDueRecurringChargesParams): DueRecurringCharge[] =>
  Object.values(flatApplicationMaps.byId).flatMap((application) => {
    if (!isDefined(application) || isDefined(application.deletedAt)) {
      return [];
    }

    // Undefined until the upgrade that adds the column has run.
    const billing: ApplicationBilling = application.billing ?? {};

    return Object.entries(billing.recurring ?? {}).flatMap(
      ([chargeKey, charge]) =>
        isDefined(charge) &&
        !alreadyChargedKeys.has(
          buildRecurringChargeKey({
            applicationId: application.id,
            chargeKey,
          }),
        )
          ? [{ applicationId: application.id, chargeKey, charge }]
          : [],
    );
  });

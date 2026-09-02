/* @license Enterprise */

import {
  type ApplicationBilling,
  type RecurringCharge,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';

export type DeclaredRecurringCharge = {
  applicationId: string;
  chargeKey: string;
  charge: RecurringCharge;
};

type CollectDeclaredRecurringChargesParams = {
  flatApplicationMaps: FlatApplicationCacheMaps;
};

// The recurring charges installed applications declare, read straight from the
// already-loaded cache. Uninstalled applications are skipped so a removed app
// stops billing from the next period; the period it was removed in was already
// raised. Collected before the already-charged lookup so a workspace whose apps
// declare nothing costs no ClickHouse read.
export const collectDeclaredRecurringCharges = ({
  flatApplicationMaps,
}: CollectDeclaredRecurringChargesParams): DeclaredRecurringCharge[] =>
  Object.values(flatApplicationMaps.byId).flatMap((application) => {
    if (!isDefined(application) || isDefined(application.deletedAt)) {
      return [];
    }

    // Undefined until the upgrade that adds the column has run.
    const billing: ApplicationBilling = application.billing ?? {};

    return Object.entries(billing.recurring ?? {}).flatMap(
      ([chargeKey, charge]) =>
        isDefined(charge)
          ? [{ applicationId: application.id, chargeKey, charge }]
          : [],
    );
  });

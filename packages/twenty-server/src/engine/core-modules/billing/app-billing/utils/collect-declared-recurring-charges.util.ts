/* @license Enterprise */

import {
  type ApplicationBilling,
  isRecurringCharge,
  type RecurringCharge,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';

export type DeclaredRecurringCharge = {
  applicationId: string;
  chargeKey: string;
  charge: RecurringCharge;
};

export type RejectedRecurringCharge = {
  applicationId: string;
  chargeKey: string;
  reason: string;
};

export type CollectDeclaredRecurringChargesResult = {
  declaredCharges: DeclaredRecurringCharge[];
  rejectedCharges: RejectedRecurringCharge[];
};

type CollectDeclaredRecurringChargesParams = {
  flatApplicationMaps: FlatApplicationCacheMaps;
};

// The recurring charges installed applications declare, read straight from the
// already-loaded cache. Uninstalled applications are skipped so a removed app
// stops billing from the next period; the period it was removed in was already
// raised. Collected before the already-charged lookup so a workspace whose apps
// declare nothing costs no ClickHouse read.
//
// `billing` is jsonb, so a declaration is untrusted input however it got there:
// the manifest is persisted without a shape check, and nothing stops a row
// being written by another route. Every declaration is validated here, at the
// point the platform decides to debit, rather than relying on the SDK having
// validated it at build time. A rejected declaration is returned rather than
// dropped silently so the caller can report an app that will not be billed.
export const collectDeclaredRecurringCharges = ({
  flatApplicationMaps,
}: CollectDeclaredRecurringChargesParams): CollectDeclaredRecurringChargesResult => {
  const declaredCharges: DeclaredRecurringCharge[] = [];
  const rejectedCharges: RejectedRecurringCharge[] = [];

  for (const application of Object.values(flatApplicationMaps.byId)) {
    if (!isDefined(application) || isDefined(application.deletedAt)) {
      continue;
    }

    // Undefined until the upgrade that adds the column has run.
    const billing: ApplicationBilling = application.billing ?? {};
    const recurring = billing.recurring;

    // An array is typeof 'object', and Object.entries would then bill each
    // element under its numeric index as if it were a charge name.
    if (
      !isDefined(recurring) ||
      typeof recurring !== 'object' ||
      Array.isArray(recurring)
    ) {
      continue;
    }

    for (const [chargeKey, charge] of Object.entries(recurring)) {
      if (isRecurringCharge(charge)) {
        declaredCharges.push({
          applicationId: application.id,
          chargeKey,
          charge,
        });
        continue;
      }

      rejectedCharges.push({
        applicationId: application.id,
        chargeKey,
        reason: 'malformed or out-of-bounds recurring charge declaration',
      });
    }
  }

  return { declaredCharges, rejectedCharges };
};

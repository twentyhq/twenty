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

// `billing` is jsonb persisted without a shape check, so declarations are validated here, at the point of debit
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

    // Arrays are typeof 'object': Object.entries would bill each element by index
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

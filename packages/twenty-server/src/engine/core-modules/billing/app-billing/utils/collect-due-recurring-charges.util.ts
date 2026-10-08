/* @license Enterprise */

import { type DeclaredRecurringCharge } from 'src/engine/core-modules/billing/app-billing/utils/collect-declared-recurring-charges.util';
import { buildRecurringChargeKey } from 'src/engine/core-modules/usage/utils/build-recurring-charge-key.util';

type CollectDueRecurringChargesParams = {
  declaredCharges: DeclaredRecurringCharge[];
  alreadyChargedKeys: Set<string>;
};

// The usage row is its own record of the charge, which keeps the daily job idempotent
export const collectDueRecurringCharges = ({
  declaredCharges,
  alreadyChargedKeys,
}: CollectDueRecurringChargesParams): DeclaredRecurringCharge[] =>
  declaredCharges.filter(
    ({ applicationId, chargeKey }) =>
      !alreadyChargedKeys.has(
        buildRecurringChargeKey({ applicationId, chargeKey }),
      ),
  );

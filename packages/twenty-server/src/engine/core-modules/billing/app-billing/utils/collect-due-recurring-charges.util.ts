/* @license Enterprise */

import { type DeclaredRecurringCharge } from 'src/engine/core-modules/billing/app-billing/utils/collect-declared-recurring-charges.util';
import { buildRecurringChargeKey } from 'src/engine/core-modules/usage/utils/build-recurring-charge-key.util';

type CollectDueRecurringChargesParams = {
  declaredCharges: DeclaredRecurringCharge[];
  alreadyChargedKeys: Set<string>;
};

// The declared charges this period does not already carry. The usage row is its
// own record of the charge, so keying on application and charge is what keeps
// the daily job idempotent without separate bookkeeping.
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

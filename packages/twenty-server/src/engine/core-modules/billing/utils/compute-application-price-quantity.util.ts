/* @license Enterprise */

import { type ApplicationBillingPrice } from 'twenty-shared/application';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

export const computeApplicationPriceQuantity = ({
  per,
  workspaceMemberCount,
}: {
  per: ApplicationBillingPrice['per'] | null;
  workspaceMemberCount: number;
}): number => {
  if (!isDefined(per)) {
    return 1;
  }

  switch (per) {
    case 'WORKSPACE_MEMBER':
      return workspaceMemberCount;
    default:
      return assertUnreachable(per);
  }
};

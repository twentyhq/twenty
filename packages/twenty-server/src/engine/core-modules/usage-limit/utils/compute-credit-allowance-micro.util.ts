import { isDefined } from 'twenty-shared/utils';

import { type CreditAllowanceGrant } from 'src/engine/core-modules/usage-limit/types/credit-allowance-grant.type';

export const computeCreditAllowanceMicro = ({
  planAllowanceMicro,
  grants,
  nowMs,
}: {
  planAllowanceMicro: number;
  grants: CreditAllowanceGrant[];
  nowMs: number;
}): number =>
  grants
    .filter(
      ({ effectiveAtMs, expiresAtMs }) =>
        effectiveAtMs <= nowMs &&
        (!isDefined(expiresAtMs) || expiresAtMs > nowMs),
    )
    .reduce(
      (allowanceMicro, { amountMicro }) => allowanceMicro + amountMicro,
      planAllowanceMicro,
    );

import { isDefined } from 'twenty-shared/utils';

import { type CreditAllowanceSchedule } from 'src/engine/core-modules/usage-limit/types/credit-allowance-schedule.type';

export const computeCreditAllowanceMicro = ({
  schedule,
  nowMs,
}: {
  schedule: CreditAllowanceSchedule;
  nowMs: number;
}): number =>
  schedule.grants
    .filter(
      ({ effectiveAtMs, expiresAtMs }) =>
        effectiveAtMs <= nowMs &&
        (!isDefined(expiresAtMs) || expiresAtMs > nowMs),
    )
    .reduce(
      (allowanceMicro, { amountMicro }) => allowanceMicro + amountMicro,
      schedule.planAllowanceMicro,
    );

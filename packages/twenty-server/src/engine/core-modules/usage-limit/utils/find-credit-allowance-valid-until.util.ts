import { isDefined } from 'twenty-shared/utils';

import { type CreditAllowanceSchedule } from 'src/engine/core-modules/usage-limit/types/credit-allowance-schedule.type';

export const findCreditAllowanceValidUntil = ({
  schedule,
  nowMs,
  periodEndMs,
}: {
  schedule: CreditAllowanceSchedule;
  nowMs: number;
  periodEndMs: number;
}): number =>
  Math.min(
    periodEndMs,
    ...schedule.grants
      .flatMap(({ effectiveAtMs, expiresAtMs }) => [effectiveAtMs, expiresAtMs])
      .filter(
        (boundaryMs): boundaryMs is number =>
          isDefined(boundaryMs) && boundaryMs > nowMs,
      ),
  );

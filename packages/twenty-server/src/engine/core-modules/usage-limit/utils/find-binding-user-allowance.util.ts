import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { isLimitExhausted } from 'src/engine/core-modules/usage-limit/utils/is-limit-exhausted.util';

type UserAllowance = {
  counter: UserAllowanceQuotaCounter;
  consumedValue: number | null;
};

const computeRemaining = ({ counter, consumedValue }: UserAllowance): number =>
  counter.limitValue - (consumedValue ?? 0);

export const findBindingUserAllowance = ({
  userAllowanceCounters,
  userAllowanceConsumedValues,
}: {
  userAllowanceCounters: UserAllowanceQuotaCounter[];
  userAllowanceConsumedValues: (number | null)[];
}): (UserAllowance & { isExhausted: boolean }) | null => {
  const userAllowances = userAllowanceCounters.map((counter, index) => ({
    counter,
    consumedValue: userAllowanceConsumedValues[index] ?? null,
  }));

  const exhaustedUserAllowances = userAllowances.filter(
    ({ counter, consumedValue }) =>
      isDefined(consumedValue) &&
      isLimitExhausted({
        consumed: consumedValue,
        cost: 0,
        limitValue: counter.limitValue,
      }),
  );

  if (isNonEmptyArray(exhaustedUserAllowances)) {
    return {
      ...exhaustedUserAllowances.reduce((latest, candidate) =>
        candidate.counter.periodEnd.getTime() >
        latest.counter.periodEnd.getTime()
          ? candidate
          : latest,
      ),
      isExhausted: true,
    };
  }

  if (!isNonEmptyArray(userAllowances)) {
    return null;
  }

  return {
    ...userAllowances.reduce((tightest, candidate) =>
      computeRemaining(candidate) < computeRemaining(tightest)
        ? candidate
        : tightest,
    ),
    isExhausted: false,
  };
};

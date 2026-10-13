import { isDefined } from 'twenty-shared/utils';

import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';

export const buildMemberFirstScriptArguments = ({
  amount,
  memberLimit,
  isFallbackEnabled,
  warms,
}: {
  amount: number;
  memberLimit: number;
  isFallbackEnabled: boolean;
  warms: ({ value: number; ttl: number } | null)[];
}): string[] => {
  if (!isValidCreditAmountMicro(amount)) {
    throw new Error(
      `Member-first amount ${amount} is not a non-negative safe integer`,
    );
  }

  if (!isValidCreditAmountMicro(memberLimit)) {
    throw new Error(
      `Member-first limit ${memberLimit} is not a non-negative safe integer`,
    );
  }

  for (const warm of warms) {
    if (
      isDefined(warm) &&
      !(
        isValidCreditAmountMicro(warm.value) &&
        Number.isSafeInteger(warm.ttl) &&
        warm.ttl > 0
      )
    ) {
      throw new Error(
        `Member-first warm value ${warm.value} with TTL ${warm.ttl} is not a non-negative safe integer with a positive safe TTL`,
      );
    }
  }

  return [
    JSON.stringify({ amount, memberLimit, isFallbackEnabled }),
    JSON.stringify(warms.map((warm) => warm?.value ?? false)),
    JSON.stringify(warms.map((warm) => warm?.ttl ?? false)),
  ];
};

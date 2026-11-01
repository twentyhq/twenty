import { isDefined } from 'twenty-shared/utils';

import { type QuotaDebit } from 'src/engine/core-modules/usage-limit/types/quota-debit.type';

export const buildConsumeScriptArguments = ({
  entries,
  isUserCreditsFallbackEnabled = false,
}: {
  entries: {
    amount: number;
    warm: { value: number; ttl: number } | null;
    split?: QuotaDebit['split'];
  }[];
  isUserCreditsFallbackEnabled?: boolean;
}): string[] => {
  for (const { amount, warm, split } of entries) {
    if (!(Number.isSafeInteger(amount) && amount >= 0)) {
      throw new Error(
        `Counter amount ${amount} is not a non-negative safe integer`,
      );
    }

    if (
      isDefined(warm) &&
      !(
        Number.isSafeInteger(warm.value) &&
        warm.value >= 0 &&
        Number.isSafeInteger(warm.ttl) &&
        warm.ttl > 0
      )
    ) {
      throw new Error(
        `Counter warm value ${warm.value} with TTL ${warm.ttl} is not a non-negative safe integer with a positive safe TTL`,
      );
    }

    if (
      split?.kind === 'userCredits' &&
      !(Number.isSafeInteger(split.limitValue) && split.limitValue >= 0)
    ) {
      throw new Error(
        `User credits limit ${split.limitValue} is not a non-negative safe integer`,
      );
    }
  }

  return [
    JSON.stringify(entries.map(({ amount }) => amount)),
    JSON.stringify(entries.map(({ warm }) => warm?.value ?? false)),
    JSON.stringify(entries.map(({ warm }) => warm?.ttl ?? false)),
    JSON.stringify(entries.map(({ split }) => split?.kind ?? false)),
    JSON.stringify(
      entries.map(({ split }) =>
        split?.kind === 'userCredits' ? split.limitValue : false,
      ),
    ),
    String(isUserCreditsFallbackEnabled),
  ];
};

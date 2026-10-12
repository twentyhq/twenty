import { isDefined } from 'twenty-shared/utils';

export const buildConsumeScriptArguments = (
  entries: { amount: number; warm: { value: number; ttl: number } | null }[],
): string[] => {
  for (const { amount, warm } of entries) {
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
  }

  return [
    JSON.stringify(entries.map(({ amount }) => amount)),
    JSON.stringify(entries.map(({ warm }) => warm?.value ?? false)),
    JSON.stringify(entries.map(({ warm }) => warm?.ttl ?? false)),
  ];
};

import { isDefined } from 'twenty-shared/utils';

export const buildConsumeScriptArguments = (
  entries: { amount: number; warm: { value: number; pxMs: number } | null }[],
): string[] => {
  for (const { amount, warm } of entries) {
    if (!Number.isSafeInteger(amount)) {
      throw new Error(`Counter amount ${amount} is not a safe integer`);
    }

    if (
      isDefined(warm) &&
      !(
        Number.isSafeInteger(warm.value) &&
        warm.value >= 0 &&
        Number.isSafeInteger(warm.pxMs) &&
        warm.pxMs > 0
      )
    ) {
      throw new Error(
        `Counter warm value ${warm.value} with PX ${warm.pxMs} is not a non-negative safe integer with a positive safe PX`,
      );
    }
  }

  return [
    JSON.stringify(entries.map(({ amount }) => amount)),
    JSON.stringify(entries.map(({ warm }) => warm?.value ?? false)),
    JSON.stringify(entries.map(({ warm }) => warm?.pxMs ?? false)),
  ];
};

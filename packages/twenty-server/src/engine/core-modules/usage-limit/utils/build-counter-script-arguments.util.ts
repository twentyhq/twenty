import { isDefined } from 'twenty-shared/utils';

export const buildCounterScriptArguments = (
  entries: { amount: number; seed: { value: number; pxMs: number } | null }[],
): string[] => {
  for (const { amount, seed } of entries) {
    if (!Number.isSafeInteger(amount)) {
      throw new Error(`Counter amount ${amount} is not a safe integer`);
    }

    if (
      isDefined(seed) &&
      !(
        Number.isSafeInteger(seed.value) &&
        seed.value >= 0 &&
        Number.isSafeInteger(seed.pxMs) &&
        seed.pxMs > 0
      )
    ) {
      throw new Error(
        `Counter seed ${seed.value} with PX ${seed.pxMs} is not a non-negative safe integer with a positive safe PX`,
      );
    }
  }

  return [
    JSON.stringify(entries.map(({ amount }) => amount)),
    JSON.stringify(entries.map(({ seed }) => seed?.value ?? false)),
    JSON.stringify(entries.map(({ seed }) => seed?.pxMs ?? false)),
  ];
};

import { isNumericRange } from '~/utils/validation/isNumericRange';

// Ranges inside a list ("1-3,5") are expanded so each value gets described
export const expandCronListValues = (listValue: string): string[] => {
  const values = listValue
    .split(',')
    .map((value) => value.trim())
    .flatMap((value) => {
      if (!isNumericRange(value) || !value.includes('-')) {
        return [value];
      }

      const [start, end] = value.split('-').map((bound) => parseInt(bound, 10));

      if (start > end) {
        return [value];
      }

      return Array.from({ length: end - start + 1 }, (_, index) =>
        String(start + index),
      );
    });

  return [...new Set(values)];
};

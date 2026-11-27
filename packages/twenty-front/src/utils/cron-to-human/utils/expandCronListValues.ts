import { isNumericRange } from '~/utils/validation/isNumericRange';

export const expandCronListValues = (listValue: string): string[] =>
  listValue
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

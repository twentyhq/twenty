import { selectOrdinal } from '@lingui/core/macro';

export const getOrdinalNumber = (num: number): string => {
  try {
    return selectOrdinal(num, {
      one: `${num}st`,
      two: `${num}nd`,
      few: `${num}rd`,
      other: `${num}th`,
    });
  } catch {
    // Fallback for test environment - basic English ordinals
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${num}th`;
    }

    switch (lastDigit) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  }
};

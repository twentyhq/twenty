import { isNonEmptyString, isNumber } from '@sniptt/guards';

export const getBookCallStepMinEmployeeCount = ({
  calendarBookingPageId,
  minEmployeeCount,
}: {
  calendarBookingPageId: string | undefined;
  minEmployeeCount: number | undefined;
}): number | null => {
  if (
    !isNonEmptyString(calendarBookingPageId) ||
    !isNumber(minEmployeeCount) ||
    minEmployeeCount <= 0
  ) {
    return null;
  }

  return minEmployeeCount;
};

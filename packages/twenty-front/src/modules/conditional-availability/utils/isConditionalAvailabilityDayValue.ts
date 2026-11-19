import { isDateWithoutTime } from 'twenty-shared/utils';

export const isConditionalAvailabilityDayValue = ({
  value,
}: {
  value: string;
}): boolean => {
  if (!isDateWithoutTime(value) || Number.isNaN(Date.parse(value))) {
    return false;
  }

  return new Date(value).toISOString().startsWith(value);
};

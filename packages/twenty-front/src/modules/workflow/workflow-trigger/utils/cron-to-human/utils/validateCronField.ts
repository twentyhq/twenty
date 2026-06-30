import { isDefined } from 'twenty-shared/utils';

import { type CronFieldType } from '@/workflow/workflow-trigger/utils/cron-to-human/types/cronExpressionParts';

type FieldRange = {
  min: number;
  max: number;
};

const FIELD_RANGES: Record<CronFieldType, FieldRange> = {
  seconds: { min: 0, max: 59 },
  minutes: { min: 0, max: 59 },
  hours: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 7 }, // 0 and 7 both represent Sunday
  year: { min: 1970, max: 2099 },
};

export const validateCronField = (
  value: string,
  fieldType: CronFieldType,
): boolean => {
  if (!isDefined(value) || value.trim() === '') {
    return false;
  }

  if (value === '*') {
    return true;
  }

  const range = FIELD_RANGES[fieldType];
  if (!isDefined(range)) {
    return false;
  }

  if (value.includes('/')) {
    const [rangePart, stepPart] = value.split('/');
    const step = parseInt(stepPart, 10);

    if (isNaN(step) || step <= 0) {
      return false;
    }

    if (rangePart === '*') {
      return true;
    }

    return validateCronField(rangePart, fieldType);
  }

  if (value.includes('-')) {
    const [startStr, endStr] = value.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    if (isNaN(start) || isNaN(end)) {
      return false;
    }

    return (
      start >= range.min &&
      start <= range.max &&
      end >= range.min &&
      end <= range.max &&
      start <= end
    );
  }

  if (value.includes(',')) {
    const values = value.split(',');
    return values.every((val) => validateCronField(val.trim(), fieldType));
  }

  const numValue = parseInt(value, 10);
  if (isNaN(numValue)) {
    return false;
  }

  if (fieldType === 'dayOfWeek' && (numValue === 0 || numValue === 7)) {
    return true;
  }

  return numValue >= range.min && numValue <= range.max;
};

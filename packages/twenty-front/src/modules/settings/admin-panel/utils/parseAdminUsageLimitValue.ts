import { isNonEmptyString } from 'twenty-shared/utils';

export const parseAdminUsageLimitValue = ({
  value,
  min,
  scale,
}: {
  value: string;
  min: number;
  scale: number;
}): number | null => {
  const inputValue = Number(value);
  const scaledValue = Math.round(inputValue * scale);

  return isNonEmptyString(value.trim()) &&
    Number.isSafeInteger(scaledValue) &&
    scaledValue >= min &&
    (scaledValue !== 0 || inputValue === 0)
    ? scaledValue
    : null;
};

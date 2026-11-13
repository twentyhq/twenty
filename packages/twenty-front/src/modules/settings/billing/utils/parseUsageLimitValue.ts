import { isNonEmptyString } from 'twenty-shared/utils';

export const parseUsageLimitValue = ({
  value,
  min,
  scale,
}: {
  value: string;
  min: number;
  scale: number;
}): number | null => {
  if (!isNonEmptyString(value.trim())) {
    return null;
  }

  const inputValue = Number(value);
  const scaledValue = Math.round(inputValue * scale);

  if (!Number.isSafeInteger(scaledValue) || scaledValue < min) {
    return null;
  }

  const isTooSmallToStore = scaledValue === 0 && inputValue !== 0;

  if (isTooSmallToStore) {
    return null;
  }

  return scaledValue;
};

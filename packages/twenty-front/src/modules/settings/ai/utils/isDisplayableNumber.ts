import { isDefined } from 'twenty-shared/utils';

export const isDisplayableNumber = (
  value: number | null | undefined,
): value is number => isDefined(value) && Number.isFinite(value) && value >= 0;

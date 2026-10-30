import { isNumber } from '@sniptt/guards';

export const isProgressPercentage = (value: unknown): value is number =>
  isNumber(value) && Number.isInteger(value) && value >= 0 && value <= 100;

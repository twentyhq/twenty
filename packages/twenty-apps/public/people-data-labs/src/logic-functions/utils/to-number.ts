import { isNumber } from '@sniptt/guards';

export const toNumber = (value: unknown): number | undefined =>
  isNumber(value) && Number.isFinite(value) ? value : undefined;

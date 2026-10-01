import { type QuotaMeter } from 'src/engine/core-modules/usage-limit/types/quota-meter.type';

export type QuotaCost = Record<QuotaMeter, number>;

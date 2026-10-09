import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';

export type QuotaDebit = {
  counter: QuotaCounter;
  amount: number;
};

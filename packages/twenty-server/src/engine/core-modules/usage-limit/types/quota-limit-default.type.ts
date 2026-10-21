import { type QuotaLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/quota-limit-default-definition.type';

export type QuotaLimitDefault = Omit<
  QuotaLimitDefaultDefinition,
  'limitValueConfigVariable'
> & {
  limitValue: number;
};

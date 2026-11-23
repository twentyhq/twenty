import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';

export type QuotaLimitDefaultWithNullableValue = Omit<
  QuotaLimitDefault,
  'limitValue'
> & {
  limitValue: number | null;
};

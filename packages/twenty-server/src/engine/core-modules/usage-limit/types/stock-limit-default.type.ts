import { type StockLimitDefaultDefinition } from 'src/engine/core-modules/usage-limit/types/stock-limit-default-definition.type';

export type StockLimitDefault = Pick<
  StockLimitDefaultDefinition,
  'spenderType' | 'meter' | 'isOverridable'
> & {
  limitValue: number;
};

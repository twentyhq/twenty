import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export type StockScope = {
  spenderType: SpenderType;
  spenderId: string | null;
};

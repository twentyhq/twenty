import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export type Spender = {
  spenderType: SpenderType;
  spenderId: string;
};

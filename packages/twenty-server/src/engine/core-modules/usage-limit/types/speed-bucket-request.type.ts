import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export type SpeedBucketRequest = {
  key: string;
  burst: number;
  refillPerWindow: number;
  windowMs: number;
  spenderType: SpenderType;
  spenderId: string | null;
  isDefault: boolean;
};

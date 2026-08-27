import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

export type QuotaCounterRequest = {
  key: string;
  // Absolute, in the counter's meter unit; percent rules are already resolved
  // against the allowance.
  limitValue: number;
  // '' on the allowance counter, which spans every resource the way the
  // billing credit pool does.
  resourceType: UsageResourceType | '';
  // '' when the counter covers every operation of the resource.
  operationType: UsageOperationType | '';
  spenderType: SpenderType;
  spenderId: string | null;
  meter: UsageMeter;
  isFallback: boolean;
};

import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';

export const isAllowanceDerivedLimit = (
  limit: Pick<FlatUsageLimit, 'limitKind' | 'limitValueType'>,
): boolean =>
  limit.limitKind === 'quota' && limit.limitValueType === 'allowancePercent';

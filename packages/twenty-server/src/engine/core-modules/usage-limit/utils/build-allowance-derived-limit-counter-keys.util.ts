import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { isAllowanceDerivedLimit } from 'src/engine/core-modules/usage-limit/utils/is-allowance-derived-limit.util';

export const buildAllowanceDerivedLimitCounterKeys = ({
  workspaceId,
  limits,
  periodStart,
}: {
  workspaceId: string;
  limits: FlatUsageLimit[];
  periodStart: Date;
}): string[] =>
  limits.filter(isAllowanceDerivedLimit).map((limit) =>
    buildQuotaCounterKey({
      workspaceId,
      resourceType: limit.resourceType,
      operationType: limit.operationType,
      spenderType: limit.spenderType,
      spenderId: limit.spenderId,
      meter: limit.meter,
      periodUnit: limit.periodUnit,
      periodStart,
    }),
  );

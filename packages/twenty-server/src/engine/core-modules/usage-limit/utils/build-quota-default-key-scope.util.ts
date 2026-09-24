import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type QuotaDefaultKeyScope } from 'src/engine/core-modules/usage-limit/types/quota-default-key-scope.type';

export const buildQuotaDefaultKeyScope = ({
  workspaceId,
  counter,
}: {
  workspaceId: string;
  counter: LimitQuotaCounter;
}): QuotaDefaultKeyScope => ({
  workspaceId,
  resourceType: counter.resourceType,
  operationType: counter.operationType,
  spenderType: counter.spenderType,
  spenderId: counter.spenderId,
  meter: counter.meter,
  periodUnit: counter.periodUnit,
  periodStart: counter.periodStart,
});

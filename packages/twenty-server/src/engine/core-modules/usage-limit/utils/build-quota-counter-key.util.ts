import { isNonEmptyString } from '@sniptt/guards';

import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';

const ABSENT = '-';

export const buildQuotaCounterKey = ({
  workspaceId,
  counter,
}: {
  workspaceId: string;
  counter: Pick<
    LimitQuotaCounter,
    | 'resourceType'
    | 'operationTypes'
    | 'spenderType'
    | 'spenderId'
    | 'unit'
    | 'periodUnit'
    | 'periodStart'
  >;
}): string =>
  `{${workspaceId}}:quota-consumed:${counter.resourceType}:${[...counter.operationTypes].sort().join('+')}:${counter.spenderType}:${isNonEmptyString(counter.spenderId) ? counter.spenderId : ABSENT}:${counter.unit}:${counter.periodUnit}:${counter.periodStart.getTime()}`;

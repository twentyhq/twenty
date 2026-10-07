import { isNonEmptyString } from '@sniptt/guards';

import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';

const ABSENT = '-';
const DEFAULT_IDENTITY = 'default';

export const buildQuotaCounterKey = ({
  workspaceId,
  counter,
}: {
  workspaceId: string;
  counter: Pick<
    LimitQuotaCounter,
    | 'usageLimitId'
    | 'resourceType'
    | 'operationType'
    | 'spenderType'
    | 'spenderId'
    | 'unit'
    | 'periodUnit'
    | 'periodStart'
  >;
}): string =>
  `{${workspaceId}}:quota-consumed:${counter.usageLimitId ?? DEFAULT_IDENTITY}:${counter.resourceType}:${counter.operationType}:${counter.spenderType}:${isNonEmptyString(counter.spenderId) ? counter.spenderId : ABSENT}:${counter.unit}:${counter.periodUnit}:${counter.periodStart.getTime()}`;

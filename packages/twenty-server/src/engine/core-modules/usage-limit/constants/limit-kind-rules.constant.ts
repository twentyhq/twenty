import { ANCHORED_PERIOD_UNITS } from 'src/engine/core-modules/usage-limit/constants/period-units.constant';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type LimitKindRule } from 'src/engine/core-modules/usage-limit/types/limit-kind-rule.type';

export const LIMIT_KIND_RULES: Record<LimitKind, LimitKindRule> = {
  speed: {
    isAllOperationTypeAllowed: false,
    allowedPeriodUnits: ['second'],
    requiredPeriodCount: null,
    isBurstValueAllowed: true,
  },
  quota: {
    isAllOperationTypeAllowed: true,
    allowedPeriodUnits: ANCHORED_PERIOD_UNITS,
    requiredPeriodCount: 1,
    isBurstValueAllowed: false,
  },
  stock: {
    isAllOperationTypeAllowed: false,
    allowedPeriodUnits: ['lifetime'],
    requiredPeriodCount: 1,
    isBurstValueAllowed: false,
  },
};

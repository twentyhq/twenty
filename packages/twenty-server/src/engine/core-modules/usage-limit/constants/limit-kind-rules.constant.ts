import { ANCHORED_PERIOD_UNITS } from 'src/engine/core-modules/usage-limit/constants/period-units.constant';
import {
  QUOTA_METERS,
  SPEED_METERS,
  STOCK_METERS,
} from 'src/engine/core-modules/usage-limit/constants/usage-meters.constant';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type LimitKindRule } from 'src/engine/core-modules/usage-limit/types/limit-kind-rule.type';

export const LIMIT_KIND_RULES: Record<LimitKind, LimitKindRule> = {
  speed: {
    isAllOperationTypeAllowed: false,
    allowedPeriodUnits: ['second'],
    requiredPeriodCount: null,
    allowedMeters: SPEED_METERS,
    isBurstValueAllowed: true,
  },
  quota: {
    isAllOperationTypeAllowed: true,
    allowedPeriodUnits: ANCHORED_PERIOD_UNITS,
    requiredPeriodCount: 1,
    allowedMeters: QUOTA_METERS,
    isBurstValueAllowed: false,
  },
  stock: {
    isAllOperationTypeAllowed: false,
    allowedPeriodUnits: ['lifetime'],
    requiredPeriodCount: 1,
    allowedMeters: STOCK_METERS,
    isBurstValueAllowed: false,
  },
};

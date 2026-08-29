import { type LIMIT_VALUE_TYPES } from 'src/engine/core-modules/usage-limit/constants/limit-value-types.constant';

export type LimitValueType = (typeof LIMIT_VALUE_TYPES)[number];

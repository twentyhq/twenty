import { type SPENDER_TYPES } from 'src/engine/core-modules/usage-limit/constants/spender-types.constant';

export type SpenderType = (typeof SPENDER_TYPES)[number];

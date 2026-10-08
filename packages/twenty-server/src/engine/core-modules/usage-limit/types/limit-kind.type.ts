import { type LIMIT_KINDS } from 'src/engine/core-modules/usage-limit/constants/limit-kinds.constant';

export type LimitKind = (typeof LIMIT_KINDS)[number];

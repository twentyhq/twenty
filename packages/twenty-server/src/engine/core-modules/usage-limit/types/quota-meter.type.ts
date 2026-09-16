import { type QUOTA_METERS } from 'src/engine/core-modules/usage-limit/constants/usage-meters.constant';

export type QuotaMeter = (typeof QUOTA_METERS)[number];

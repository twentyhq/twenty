import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

export type PlanUsageLimitDefaults = Partial<
  Record<keyof ConfigVariables, number | null>
>;

import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export type QuotaCost = Record<UsageUnit.CREDIT, number> &
  Partial<Record<UsageUnit, number>>;

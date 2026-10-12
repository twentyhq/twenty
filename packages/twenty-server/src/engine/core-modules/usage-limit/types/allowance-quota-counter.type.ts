import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export type AllowanceQuotaCounter = {
  kind: 'allowance';
  key: string;
  unit: UsageUnit.CREDIT;
  periodStart: Date;
  periodEnd: Date;
};

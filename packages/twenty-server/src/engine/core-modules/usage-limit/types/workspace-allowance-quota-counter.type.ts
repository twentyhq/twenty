import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export type WorkspaceAllowanceQuotaCounter = {
  kind: 'workspaceAllowance';
  key: string;
  limitValue: number;
  unit: UsageUnit.CREDIT;
  periodStart: Date;
  periodEnd: Date;
};

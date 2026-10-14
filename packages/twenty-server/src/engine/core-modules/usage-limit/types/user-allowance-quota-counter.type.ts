import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type UserCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/user-credits-fallback-mode.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export type UserAllowanceQuotaCounter = {
  kind: 'userAllowance';
  key: string;
  limitValue: number;
  unit: UsageUnit.USER_CREDIT;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  periodUnit: PeriodUnit;
  userWorkspaceId: string;
  periodStart: Date;
  periodEnd: Date;
  fallback: UserCreditsFallbackMode;
};

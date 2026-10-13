import { type QuotaConsumptionScope } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export const ALLOWANCE_CONSUMPTION_SCOPE: QuotaConsumptionScope = {
  operationType: UsageOperationType.ALL,
  spenderType: 'workspace',
  spenderId: null,
  unit: UsageUnit.CREDIT,
};

import { type QuotaConsumptionScope } from 'src/engine/core-modules/usage-limit/utils/compute-quota-consumed.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export const WORKSPACE_ALLOWANCE_CONSUMPTION_SCOPE: QuotaConsumptionScope = {
  operationTypes: [UsageOperationType.ALL],
  spenderType: 'workspace',
  spenderId: null,
  unit: UsageUnit.CREDIT,
};

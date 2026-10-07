import { NON_BILLABLE_OPERATION_TYPES } from 'src/engine/core-modules/usage/constants/non-billable-operation-types.constant';

export const buildBillableOperationTypeCondition = (): {
  condition: string;
  params: { nonBillableOperationTypes: string[] };
} => ({
  condition: 'operationType NOT IN ({nonBillableOperationTypes:Array(String)})',
  params: { nonBillableOperationTypes: NON_BILLABLE_OPERATION_TYPES },
});

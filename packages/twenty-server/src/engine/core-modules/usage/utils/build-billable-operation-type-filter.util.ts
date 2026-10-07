import { buildBillableOperationTypeCondition } from 'src/engine/core-modules/usage/utils/build-billable-operation-type-condition.util';

export const buildBillableOperationTypeFilter = (): {
  clause: string;
  params: { nonBillableOperationTypes: string[] };
} => {
  const { condition, params } = buildBillableOperationTypeCondition();

  return { clause: `AND ${condition}`, params };
};

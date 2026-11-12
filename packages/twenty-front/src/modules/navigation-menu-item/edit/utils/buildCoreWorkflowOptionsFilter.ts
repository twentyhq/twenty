import { isNonEmptyString } from '@sniptt/guards';

import {
  CoreWorkflowFilterFieldKey,
  type CoreWorkflowFilterInput,
  CoreWorkflowFilterLogicalOperator,
  CoreWorkflowFilterOperand,
} from '~/generated/graphql';

export const buildCoreWorkflowOptionsFilter = (
  workflowSearch: string,
): CoreWorkflowFilterInput => ({
  logicalOperator: CoreWorkflowFilterLogicalOperator.AND,
  rules: [
    {
      fieldKey: CoreWorkflowFilterFieldKey.IS_SYSTEM,
      operand: CoreWorkflowFilterOperand.IS,
      value: 'false',
    },
    ...(isNonEmptyString(workflowSearch)
      ? [
          {
            fieldKey: CoreWorkflowFilterFieldKey.NAME,
            operand: CoreWorkflowFilterOperand.CONTAINS,
            value: workflowSearch,
          },
        ]
      : []),
  ],
});

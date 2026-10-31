import { ViewFilterOperand } from 'twenty-shared/types';

import { CoreWorkflowFilterOperand } from '~/generated/graphql';

export const CORE_WORKFLOW_FILTER_OPERAND_BY_VIEW_FILTER_OPERAND: Partial<
  Record<ViewFilterOperand, CoreWorkflowFilterOperand>
> = {
  [ViewFilterOperand.CONTAINS]: CoreWorkflowFilterOperand.CONTAINS,
  [ViewFilterOperand.DOES_NOT_CONTAIN]:
    CoreWorkflowFilterOperand.DOES_NOT_CONTAIN,
  [ViewFilterOperand.IS]: CoreWorkflowFilterOperand.IS,
  [ViewFilterOperand.IS_NOT]: CoreWorkflowFilterOperand.IS_NOT,
  [ViewFilterOperand.IS_EMPTY]: CoreWorkflowFilterOperand.IS_EMPTY,
  [ViewFilterOperand.IS_NOT_EMPTY]: CoreWorkflowFilterOperand.IS_NOT_EMPTY,
  [ViewFilterOperand.IS_BEFORE]: CoreWorkflowFilterOperand.IS_BEFORE,
  [ViewFilterOperand.IS_AFTER]: CoreWorkflowFilterOperand.IS_AFTER,
  [ViewFilterOperand.IS_IN_PAST]: CoreWorkflowFilterOperand.IS_IN_PAST,
  [ViewFilterOperand.IS_IN_FUTURE]: CoreWorkflowFilterOperand.IS_IN_FUTURE,
  [ViewFilterOperand.IS_TODAY]: CoreWorkflowFilterOperand.IS_TODAY,
  [ViewFilterOperand.IS_RELATIVE]: CoreWorkflowFilterOperand.IS_RELATIVE,
};

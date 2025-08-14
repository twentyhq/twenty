import { ViewFilterOperand } from 'twenty-shared/types';
import { ViewFilterOperand as CoreViewFilterOperand } from '~/generated-metadata/graphql';

const operandMapping: Record<ViewFilterOperand, CoreViewFilterOperand> = {
  [ViewFilterOperand.Is]: CoreViewFilterOperand.IS,
  [ViewFilterOperand.IsNotNull]: CoreViewFilterOperand.IS_NOT_NULL,
  [ViewFilterOperand.IsNot]: CoreViewFilterOperand.IS_NOT,
  [ViewFilterOperand.LessThanOrEqual]: CoreViewFilterOperand.LESS_THAN_OR_EQUAL,
  [ViewFilterOperand.GreaterThanOrEqual]:
    CoreViewFilterOperand.GREATER_THAN_OR_EQUAL,
  [ViewFilterOperand.IsBefore]: CoreViewFilterOperand.IS_BEFORE,
  [ViewFilterOperand.IsAfter]: CoreViewFilterOperand.IS_AFTER,
  [ViewFilterOperand.Contains]: CoreViewFilterOperand.CONTAINS,
  [ViewFilterOperand.DoesNotContain]: CoreViewFilterOperand.DOES_NOT_CONTAIN,
  [ViewFilterOperand.IsEmpty]: CoreViewFilterOperand.IS_EMPTY,
  [ViewFilterOperand.IsNotEmpty]: CoreViewFilterOperand.IS_NOT_EMPTY,
  [ViewFilterOperand.IsRelative]: CoreViewFilterOperand.IS_RELATIVE,
  [ViewFilterOperand.IsInPast]: CoreViewFilterOperand.IS_IN_PAST,
  [ViewFilterOperand.IsInFuture]: CoreViewFilterOperand.IS_IN_FUTURE,
  [ViewFilterOperand.IsToday]: CoreViewFilterOperand.IS_TODAY,
  [ViewFilterOperand.VectorSearch]: CoreViewFilterOperand.VECTOR_SEARCH,
};

export const convertViewFilterOperandToCore = (
  sharedOperand: ViewFilterOperand,
): CoreViewFilterOperand => {
  return operandMapping[sharedOperand];
};

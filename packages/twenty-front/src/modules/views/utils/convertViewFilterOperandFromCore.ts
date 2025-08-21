import { ViewFilterOperand } from 'twenty-shared/types';
import { ViewFilterOperand as CoreViewFilterOperand } from '~/generated/graphql';

const mappingFromCore: Record<CoreViewFilterOperand, ViewFilterOperand> = {
  [CoreViewFilterOperand.IS]: ViewFilterOperand.Is,
  [CoreViewFilterOperand.IS_NOT_NULL]: ViewFilterOperand.IsNotNull,
  [CoreViewFilterOperand.IS_NOT]: ViewFilterOperand.IsNot,
  [CoreViewFilterOperand.LESS_THAN_OR_EQUAL]: ViewFilterOperand.LessThanOrEqual,
  [CoreViewFilterOperand.GREATER_THAN_OR_EQUAL]:
    ViewFilterOperand.GreaterThanOrEqual,
  [CoreViewFilterOperand.IS_BEFORE]: ViewFilterOperand.IsBefore,
  [CoreViewFilterOperand.IS_AFTER]: ViewFilterOperand.IsAfter,
  [CoreViewFilterOperand.CONTAINS]: ViewFilterOperand.Contains,
  [CoreViewFilterOperand.DOES_NOT_CONTAIN]: ViewFilterOperand.DoesNotContain,
  [CoreViewFilterOperand.IS_EMPTY]: ViewFilterOperand.IsEmpty,
  [CoreViewFilterOperand.IS_NOT_EMPTY]: ViewFilterOperand.IsNotEmpty,
  [CoreViewFilterOperand.IS_RELATIVE]: ViewFilterOperand.IsRelative,
  [CoreViewFilterOperand.IS_IN_PAST]: ViewFilterOperand.IsInPast,
  [CoreViewFilterOperand.IS_IN_FUTURE]: ViewFilterOperand.IsInFuture,
  [CoreViewFilterOperand.IS_TODAY]: ViewFilterOperand.IsToday,
  [CoreViewFilterOperand.VECTOR_SEARCH]: ViewFilterOperand.VectorSearch,
};

export const convertViewFilterOperandFromCore = (
  coreOperand: CoreViewFilterOperand,
): ViewFilterOperand => mappingFromCore[coreOperand];

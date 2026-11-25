import { type ConditionalEvaluationVariableName } from 'twenty-shared/conditional-evaluation';

export const CONDITIONAL_AVAILABILITY_FILTER_VARIABLES = [
  'currentRole',
  'currentWorkspaceMember',
  'device',
] as const satisfies readonly ConditionalEvaluationVariableName<'pageLayoutWidget'>[];

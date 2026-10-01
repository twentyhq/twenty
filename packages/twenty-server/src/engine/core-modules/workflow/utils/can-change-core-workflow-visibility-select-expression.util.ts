import { canChangeCoreWorkflowVisibilitySqlPredicate } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility-sql-predicate.util';

// An owned workflow read by an API key yields `false OR NULL`: WHERE treats that NULL as false, a projection
// does not, and canChangeVisibility is non-nullable
export const canChangeCoreWorkflowVisibilitySelectExpression = (parameters: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `coalesce(${canChangeCoreWorkflowVisibilitySqlPredicate(parameters)}, false)`;

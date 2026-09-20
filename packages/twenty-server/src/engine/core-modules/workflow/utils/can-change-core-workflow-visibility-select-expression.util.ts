import { canChangeCoreWorkflowVisibilitySqlPredicate } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility-sql-predicate.util';

// Selecting the predicate is not the same as filtering on it: an owned
// workflow read by an API key gives `false OR NULL`, which is NULL, and
// canChangeVisibility is a non-nullable GraphQL field. A WHERE clause treats
// that NULL as false already, a projection does not.
export const canChangeCoreWorkflowVisibilitySelectExpression = (parameters: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `coalesce(${canChangeCoreWorkflowVisibilitySqlPredicate(parameters)}, false)`;

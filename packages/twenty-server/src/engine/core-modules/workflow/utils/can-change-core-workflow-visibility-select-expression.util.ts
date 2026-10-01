import { canChangeCoreWorkflowVisibilitySqlPredicate } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility-sql-predicate.util';

// an API key reader yields `false OR NULL` in a projection, and canChangeVisibility is non-nullable
export const canChangeCoreWorkflowVisibilitySelectExpression = (parameters: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `coalesce(${canChangeCoreWorkflowVisibilitySqlPredicate(parameters)}, false)`;

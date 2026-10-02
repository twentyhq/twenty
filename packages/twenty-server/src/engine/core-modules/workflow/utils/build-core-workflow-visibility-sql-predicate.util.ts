import { WorkflowVisibility } from 'twenty-shared/types';

import { canChangeCoreWorkflowVisibilitySqlPredicate } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility-sql-predicate.util';

// SQL twin of buildCoreWorkflowVisibilityWhere for the raw keyset list query; keep them in sync
export const buildCoreWorkflowVisibilitySqlPredicate = ({
  tableAlias,
  userWorkspaceIdParameter,
}: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `(${tableAlias}."visibility" = '${WorkflowVisibility.WORKSPACE}' OR ${canChangeCoreWorkflowVisibilitySqlPredicate({ tableAlias, userWorkspaceIdParameter })})`;

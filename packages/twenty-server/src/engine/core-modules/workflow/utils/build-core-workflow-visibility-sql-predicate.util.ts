import { WorkflowVisibility } from 'twenty-shared/types';

import { canChangeCoreWorkflowVisibilitySqlPredicate } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility-sql-predicate.util';

// The list query is raw SQL on a keyset index, so it needs the same rule as a
// fragment rather than a FindOptionsWhere.
export const buildCoreWorkflowVisibilitySqlPredicate = ({
  tableAlias,
  userWorkspaceIdParameter,
}: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `(${tableAlias}."visibility" = '${WorkflowVisibility.WORKSPACE}' OR ${canChangeCoreWorkflowVisibilitySqlPredicate({ tableAlias, userWorkspaceIdParameter })})`;

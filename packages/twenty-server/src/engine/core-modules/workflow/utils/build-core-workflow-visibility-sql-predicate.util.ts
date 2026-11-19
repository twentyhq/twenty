import { WorkflowVisibility } from 'twenty-shared/types';

// SQL twin of buildCoreWorkflowVisibilityWhere for the raw keyset list query; keep them in sync
export const buildCoreWorkflowVisibilitySqlPredicate = ({
  tableAlias,
  userWorkspaceIdParameter,
}: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `(${tableAlias}."visibility" = '${WorkflowVisibility.WORKSPACE}' OR ${tableAlias}."createdByUserWorkspaceId" = ${userWorkspaceIdParameter}::uuid)`;

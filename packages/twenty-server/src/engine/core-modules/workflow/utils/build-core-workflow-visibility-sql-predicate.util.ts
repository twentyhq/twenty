// SQL twin of buildCoreWorkflowVisibilityWhere for the raw keyset list query; keep them in sync
export const buildCoreWorkflowVisibilitySqlPredicate = ({
  tableAlias,
  userWorkspaceIdParameter,
}: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `(NOT ${tableAlias}."isPrivate" OR ${tableAlias}."createdByUserWorkspaceId" = ${userWorkspaceIdParameter}::uuid)`;

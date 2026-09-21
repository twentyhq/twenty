// The caller binds its own parameter for the reader, which is null for an API
// key — hence the explicit IS NULL rather than a coalesce, which would read a
// null reader as matching a null owner.
export const canChangeCoreWorkflowVisibilitySqlPredicate = ({
  tableAlias,
  userWorkspaceIdParameter,
}: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `(${tableAlias}."createdByUserWorkspaceId" IS NULL OR ${tableAlias}."createdByUserWorkspaceId" = ${userWorkspaceIdParameter}::uuid)`;

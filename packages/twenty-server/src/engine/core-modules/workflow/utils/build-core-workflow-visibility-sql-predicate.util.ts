import { type PrivatableEntityCallerScope } from 'src/engine/permissions/metadata-permissions/types/privatable-entity-caller-scope.type';

// SQL twin of buildCoreWorkflowVisibilityWhere for the raw keyset list query; keep them in sync
export const buildCoreWorkflowVisibilitySqlPredicate = ({
  tableAlias,
  userWorkspaceIdParameter,
  callerScope,
}: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
  callerScope: PrivatableEntityCallerScope;
}): string =>
  `(NOT ${tableAlias}."isPrivate" OR ${tableAlias}."createdByUserWorkspaceId" = ${userWorkspaceIdParameter}::uuid OR ${callerScope.type === 'all' ? 'TRUE' : 'FALSE'})`;

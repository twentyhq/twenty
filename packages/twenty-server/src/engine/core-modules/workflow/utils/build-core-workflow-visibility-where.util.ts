import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, type FindOptionsWhere } from 'typeorm';

import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';

// A workflow is readable when the whole workspace can see it, when the reader
// is the person who made it, or when nobody owns it. That last branch matters:
// the owner FK is ON DELETE SET NULL, so a workflow whose creator left the
// workspace would otherwise be visible to no one and editable by no one while
// still running. Every read and write path goes through one of these builders
// so there is a single place to audit.
//
// The reader is absent for an API key, which authenticates a workspace rather
// than a person: it reaches everything the workspace shares and nobody's
// private workflow.
//
// The clauses are OR-ed by TypeORM, so any extra condition has to be repeated
// in each of them.
export const buildCoreWorkflowVisibilityWhere = ({
  userWorkspaceId,
  ...where
}: FindOptionsWhere<WorkflowEntity> & {
  userWorkspaceId: string | undefined;
}): FindOptionsWhere<WorkflowEntity>[] => [
  { ...where, visibility: WorkflowVisibility.WORKSPACE },
  { ...where, createdByUserWorkspaceId: IsNull() },
  ...(isDefined(userWorkspaceId)
    ? [{ ...where, createdByUserWorkspaceId: userWorkspaceId }]
    : []),
];

// The list query is raw SQL on a keyset index, so it needs the same rule as a
// fragment. The caller binds its own parameter for the reader, which is null
// for an API key — hence the explicit IS NULL rather than a coalesce, which
// would read a null reader as matching a null owner.
export const buildCoreWorkflowVisibilitySqlPredicate = ({
  tableAlias,
  userWorkspaceIdParameter,
}: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `(${tableAlias}."visibility" = '${WorkflowVisibility.WORKSPACE}' OR ${canChangeCoreWorkflowVisibilitySqlPredicate({ tableAlias, userWorkspaceIdParameter })})`;

// Whether the reader may hand this workflow to the workspace or keep it to
// themselves: they made it, or nobody did. Kept beside the read rule because
// the two have to agree about an ownerless workflow.
export const canChangeCoreWorkflowVisibility = ({
  createdByUserWorkspaceId,
  userWorkspaceId,
}: {
  createdByUserWorkspaceId: string | null;
  userWorkspaceId: string | undefined;
}): boolean =>
  createdByUserWorkspaceId === null ||
  (isDefined(userWorkspaceId) && createdByUserWorkspaceId === userWorkspaceId);

export const canChangeCoreWorkflowVisibilitySqlPredicate = ({
  tableAlias,
  userWorkspaceIdParameter,
}: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `(${tableAlias}."createdByUserWorkspaceId" IS NULL OR ${tableAlias}."createdByUserWorkspaceId" = ${userWorkspaceIdParameter}::uuid)`;

// Selecting the predicate is not the same as filtering on it: an owned
// workflow read by an API key gives `false OR NULL`, which is NULL, and
// canChangeVisibility is a non-nullable GraphQL field. A WHERE clause treats
// that NULL as false already, a projection does not.
export const canChangeCoreWorkflowVisibilitySelectExpression = (parameters: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `coalesce(${canChangeCoreWorkflowVisibilitySqlPredicate(parameters)}, false)`;

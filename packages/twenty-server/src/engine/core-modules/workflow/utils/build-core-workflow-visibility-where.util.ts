import { WorkflowVisibility } from 'twenty-shared/types';
import { IsNull, type FindOptionsWhere } from 'typeorm';

import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';

// A workflow is readable when the whole workspace can see it, when the reader
// is the person who made it, or when nobody owns it. That last branch matters:
// the owner FK is ON DELETE SET NULL, so a workflow whose creator left the
// workspace would otherwise be visible to no one and editable by no one while
// still running. Every read and write path goes through one of these builders
// so there is a single place to audit.
//
// The clauses are OR-ed by TypeORM, so any extra condition has to be repeated
// in each of them.
export const buildCoreWorkflowVisibilityWhere = ({
  userWorkspaceId,
  ...where
}: FindOptionsWhere<WorkflowEntity> & {
  userWorkspaceId: string;
}): FindOptionsWhere<WorkflowEntity>[] => [
  { ...where, visibility: WorkflowVisibility.WORKSPACE },
  { ...where, createdByUserWorkspaceId: userWorkspaceId },
  { ...where, createdByUserWorkspaceId: IsNull() },
];

// The list query is raw SQL on a keyset index, so it needs the same rule as a
// fragment. The caller binds its own parameter for the reader.
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
  userWorkspaceId: string;
}): boolean =>
  createdByUserWorkspaceId === null ||
  createdByUserWorkspaceId === userWorkspaceId;

export const canChangeCoreWorkflowVisibilitySqlPredicate = ({
  tableAlias,
  userWorkspaceIdParameter,
}: {
  tableAlias: string;
  userWorkspaceIdParameter: string;
}): string =>
  `coalesce(${tableAlias}."createdByUserWorkspaceId" = ${userWorkspaceIdParameter}::uuid, true)`;

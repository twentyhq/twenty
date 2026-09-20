import { WorkflowVisibility } from 'twenty-shared/types';
import { type FindOptionsWhere } from 'typeorm';

import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';

// A workflow is readable when the whole workspace can see it, or when the
// reader is the person who made it. Every read and write path goes through one
// of these two builders so there is a single place to audit.
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
  `(${tableAlias}."visibility" = '${WorkflowVisibility.WORKSPACE}' OR ${tableAlias}."createdByUserWorkspaceId" = ${userWorkspaceIdParameter}::uuid)`;

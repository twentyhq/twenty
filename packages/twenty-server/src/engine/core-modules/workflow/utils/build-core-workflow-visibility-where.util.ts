import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, type FindOptionsWhere } from 'typeorm';

import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';

// A workflow is readable when the whole workspace can see it, when the reader
// is the person who made it, or when nobody owns it. That last branch matters:
// the owner FK is ON DELETE SET NULL, so a workflow whose creator left the
// workspace would otherwise be visible to no one and editable by no one while
// still running.
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

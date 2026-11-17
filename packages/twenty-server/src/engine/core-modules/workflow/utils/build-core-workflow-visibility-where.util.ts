import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere } from 'typeorm';

import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';

// userWorkspaceId is undefined for API keys, which see shared workflows but nobody's private one.
// TypeORM ORs these clauses, so extra conditions go in each.
export const buildCoreWorkflowVisibilityWhere = ({
  userWorkspaceId,
  ...where
}: FindOptionsWhere<WorkflowEntity> & {
  userWorkspaceId: string | undefined;
}): FindOptionsWhere<WorkflowEntity>[] => [
  { ...where, visibility: WorkflowVisibility.WORKSPACE },
  ...(isDefined(userWorkspaceId)
    ? [{ ...where, createdByUserWorkspaceId: userWorkspaceId }]
    : []),
];

import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere } from 'typeorm';

import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';

// TypeORM ORs these clauses, so extra conditions go in each
export const buildCoreWorkflowVisibilityWhere = ({
  userWorkspaceId,
  ...where
}: FindOptionsWhere<WorkflowEntity> & {
  userWorkspaceId: string | undefined;
}): FindOptionsWhere<WorkflowEntity>[] => [
  { ...where, isPrivate: false },
  ...(isDefined(userWorkspaceId)
    ? [{ ...where, createdByUserWorkspaceId: userWorkspaceId }]
    : []),
];

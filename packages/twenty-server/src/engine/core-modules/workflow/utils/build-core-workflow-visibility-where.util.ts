import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, type FindOptionsWhere } from 'typeorm';

import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';

// ownerless workflows stay visible because the owner FK is ON DELETE SET NULL; userWorkspaceId is undefined for API keys
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

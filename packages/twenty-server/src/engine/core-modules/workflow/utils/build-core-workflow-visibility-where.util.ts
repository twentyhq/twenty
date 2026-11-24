import { type FindOptionsWhere } from 'typeorm';

import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { type PrivatableEntityCallerScope } from 'src/engine/permissions/metadata-permissions/types/privatable-entity-caller-scope.type';
import { getPrivatableEntityCallerScope } from 'src/engine/permissions/metadata-permissions/utils/get-privatable-entity-caller-scope.util';

// TypeORM ORs these clauses, so extra conditions go in each
export const buildCoreWorkflowVisibilityWhere = ({
  callerScope = getPrivatableEntityCallerScope(),
  ...where
}: FindOptionsWhere<WorkflowEntity> & {
  callerScope?: PrivatableEntityCallerScope;
}): FindOptionsWhere<WorkflowEntity>[] => {
  switch (callerScope.type) {
    case 'all':
      return [where];
    case 'shared':
      return [{ ...where, isPrivate: false }];
    case 'sharedAndOwned':
      return [
        { ...where, isPrivate: false },
        { ...where, createdByUserWorkspaceId: callerScope.userWorkspaceId },
      ];
  }
};

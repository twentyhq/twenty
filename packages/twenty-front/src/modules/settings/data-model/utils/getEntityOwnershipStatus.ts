import { isDefined } from 'twenty-shared/utils';

export type EntityOwnershipStatus = 'managed' | 'custom';

type EntityWithApplicationId = {
  applicationId?: string | null;
};

type WorkspaceWithCustomApplication = {
  workspaceCustomApplication?: {
    id: string;
  } | null;
};

export const getEntityOwnershipStatus = ({
  entity,
  currentWorkspace,
}: {
  entity: EntityWithApplicationId;
  currentWorkspace: WorkspaceWithCustomApplication | null;
}): EntityOwnershipStatus => {
  if (isDefined(currentWorkspace) && isDefined(entity.applicationId)) {
    if (
      currentWorkspace.workspaceCustomApplication?.id === entity.applicationId
    ) {
      return 'custom';
    }
  }

  return 'managed';
};


import { isDefined } from 'twenty-shared/utils';

export const resolveViewOwnerForBackfill = ({
  id,
  visibility,
  createdByUserWorkspaceId,
  ownerUserWorkspaceId,
  activeOwnerUserWorkspaceId,
  activeCreatorUserWorkspaceId,
}: {
  id: string;
  visibility: 'WORKSPACE' | 'UNLISTED';
  createdByUserWorkspaceId: string | null;
  ownerUserWorkspaceId: string | null;
  activeOwnerUserWorkspaceId: string | null;
  activeCreatorUserWorkspaceId: string | null;
}): string | null => {
  if (visibility === 'WORKSPACE') {
    return null;
  }

  if (!isDefined(ownerUserWorkspaceId)) {
    return activeCreatorUserWorkspaceId;
  }

  if (isDefined(activeOwnerUserWorkspaceId)) {
    return ownerUserWorkspaceId;
  }

  if (ownerUserWorkspaceId === createdByUserWorkspaceId) {
    return null;
  }

  throw new Error(`View ${id} has an inactive or cross-workspace owner`);
};

import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { countAvailableWorkspaces } from '@/auth/utils/availableWorkspacesUtils';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export type EditableProfileField =
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'profilePicture';

export const useCanEditProfileField = (field: EditableProfileField) => {
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const currentUserWorkspace = useRecoilValueV2(currentUserWorkspaceState);
  const availableWorkspaces = useRecoilValueV2(availableWorkspacesState);

  if (!currentWorkspace || !currentUserWorkspace) {
    return { canEdit: false };
  }

  const editableFields = currentWorkspace.editableProfileFields ?? [];
  const workspaceAllowsField = editableFields.includes(field);

  const permissionFlags = currentUserWorkspace.permissionFlags ?? [];
  const hasProfilePermission = permissionFlags.includes(
    PermissionFlagType.PROFILE_INFORMATION,
  );

  const requiresSingleWorkspace = field === 'email';
  const isSingleWorkspaceUser =
    countAvailableWorkspaces(availableWorkspaces) <= 1;
  const meetsWorkspaceLimit = !requiresSingleWorkspace || isSingleWorkspaceUser;

  return {
    canEdit:
      workspaceAllowsField && hasProfilePermission && meetsWorkspaceLimit,
  };
};

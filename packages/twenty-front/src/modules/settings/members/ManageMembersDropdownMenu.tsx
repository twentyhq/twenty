import { useAuth } from '@/auth/hooks/useAuth';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { WORKSPACE_MEMBER_DELETION_ID } from '@/workspace-member/constants/WorkspaceMemberDeletionID';
import { workspaceMemberBeingDeletedState } from '@/workspace-member/states/workspaceMemberDeletionState';
import { useMutation, type ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconDotsVertical, IconTrash, IconUser } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { PermissionFlagType } from '~/generated/graphql';
import { IMPERSONATE_WORKSPACE_USER } from '../../auth/graphql/mutations/impersonateWorkspace';
import { IMPERSONATE_WORKSPACE_USER_BY_MEMBER_ID } from '../../auth/graphql/mutations/impersonateWorkspaceByMemberId';

type ManageMembersDropdownMenuProps = {
  dropdownId: string;
  workspaceMemberId: string;
  userWorkspaceId?: string;
};

export const ManageMembersDropdownMenu = ({
  dropdownId,
  workspaceMemberId,
  userWorkspaceId,
}: ManageMembersDropdownMenuProps) => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const { closeDropdown } = useCloseDropdown();
  const [impersonateByUserWorkspaceId] = useMutation(
    IMPERSONATE_WORKSPACE_USER,
  );
  const [impersonateByWorkspaceMemberId] = useMutation(
    IMPERSONATE_WORKSPACE_USER_BY_MEMBER_ID,
  );
  const { setImpersonationTokens } = useAuth();
  const { loadCurrentUser } = useLoadCurrentUser();
  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const canImpersonate = useHasPermissionFlag(PermissionFlagType.IMPERSONATE);
  const { openModal } = useModal();
  const setWorkspaceMemberBeingDeleted = useSetRecoilState(
    workspaceMemberBeingDeletedState,
  );

  const handleImpersonate = async () => {
    try {
      const { data, errors } = isDefined(userWorkspaceId)
        ? await impersonateByUserWorkspaceId({
            variables: { targetUserWorkspaceId: userWorkspaceId },
          })
        : await impersonateByWorkspaceMemberId({
            variables: { targetWorkspaceMemberId: workspaceMemberId },
          });

      if (isDefined(errors)) {
        enqueueErrorSnackBar({
          message: t`Cannot impersonate selected user`,
          options: { duration: 2000 },
        });
        return;
      }

      const tokens =
        data?.impersonateWorkspaceUser?.tokens ??
        data?.impersonateWorkspaceUserByWorkspaceMemberId?.tokens;
      if (isDefined(tokens)) {
        setImpersonationTokens(tokens);
        await loadCurrentUser();
        await refreshObjectMetadataItems();
      }
    } catch (error) {
      enqueueErrorSnackBar({ apolloError: error as ApolloError });
    } finally {
      closeDropdown(dropdownId);
    }
  };

  if (!canImpersonate) {
    return null;
  }

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconUser}
              text={t`Impersonate`}
              onClick={handleImpersonate}
            />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text="Delete"
              onClick={() => {
                setWorkspaceMemberBeingDeleted(workspaceMemberId);
                openModal(WORKSPACE_MEMBER_DELETION_ID);
                closeDropdown(dropdownId);
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};

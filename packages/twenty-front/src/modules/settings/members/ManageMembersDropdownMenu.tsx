import { useAuth } from '@/auth/hooks/useAuth';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { gql, useMutation, type ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconDotsVertical, IconTrash, IconUser } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type ManageMembersDropdownMenuProps = {
  dropdownId: string;
  workspaceMemberId: string;
  userWorkspaceId?: string;
  onRequestDelete: () => void;
};

const IMPERSONATE_WORKSPACE_USER = gql`
  mutation ImpersonateWorkspaceUser($targetUserWorkspaceId: UUID!) {
    impersonateWorkspaceUser(targetUserWorkspaceId: $targetUserWorkspaceId) {
      tokens {
        accessOrWorkspaceAgnosticToken { token expiresAt }
        refreshToken { token expiresAt }
      }
    }
  }
`;

const IMPERSONATE_WORKSPACE_USER_BY_MEMBER_ID = gql`
  mutation ImpersonateWorkspaceUserByWorkspaceMemberId($targetWorkspaceMemberId: UUID!) {
    impersonateWorkspaceUserByWorkspaceMemberId(targetWorkspaceMemberId: $targetWorkspaceMemberId) {
      tokens {
        accessOrWorkspaceAgnosticToken { token expiresAt }
        refreshToken { token expiresAt }
      }
    }
  }
`;

export const ManageMembersDropdownMenu = ({
  dropdownId,
  workspaceMemberId,
  userWorkspaceId,
  onRequestDelete,
}: ManageMembersDropdownMenuProps) => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const { closeDropdown } = useCloseDropdown();
  const [impersonateByUserWorkspaceId] = useMutation(IMPERSONATE_WORKSPACE_USER);
  const [impersonateByMemberId] = useMutation(IMPERSONATE_WORKSPACE_USER_BY_MEMBER_ID);
  const { setAuthTokens } = useAuth();
  const { loadCurrentUser } = useLoadCurrentUser();
  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const canImpersonate = useHasPermissionFlag('IMPERSONATE');

  const handleImpersonate = async () => {
    try {
      const { data, errors } = userWorkspaceId
        ? await impersonateByUserWorkspaceId({
            variables: { targetUserWorkspaceId: userWorkspaceId },
          })
        : await impersonateByMemberId({
            variables: { targetWorkspaceMemberId: workspaceMemberId },
          });
      if (isDefined(errors)) {
        enqueueErrorSnackBar({
          message: t`Could not impersonate user`,
          options: { duration: 2000 },
        });
        return;
      }

      const tokens =
        data?.impersonateWorkspaceUser?.tokens ??
        data?.impersonateWorkspaceUserByWorkspaceMemberId?.tokens;
      if (isDefined(tokens)) {
        setAuthTokens(tokens);
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
      clickableComponent={<LightIconButton Icon={IconDotsVertical} accent="tertiary" />}
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
                    onRequestDelete();
                    closeDropdown(dropdownId);
                }}
                />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};

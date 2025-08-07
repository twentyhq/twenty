import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';

import { useAuth } from '@/auth/hooks/useAuth';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { countAvailableWorkspaces } from '@/auth/utils/availableWorkspacesUtils';
import { isWorkspaceCreationLimitedToAdminsState } from '@/client-config/states/isWorkspaceCreationLimitedToAdminsState';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MultiWorkspaceDropdownId';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Avatar,
  IconDotsVertical,
  IconLogout,
  IconPlus,
  IconSwitchHorizontal,
  IconUserPlus,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import {
  MenuItem,
  MenuItemSelectAvatar,
  UndecoratedLink,
} from 'twenty-ui/navigation';
import {
  AvailableWorkspace,
  useSignUpInNewWorkspaceMutation,
} from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

export const MultiWorkspaceDropdownDefaultComponents = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { t } = useLingui();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const isWorkspaceCreationLimitedToAdmins = useRecoilValue(
    isWorkspaceCreationLimitedToAdminsState,
  );
  const currentUser = useRecoilValue(currentUserState);
  const availableWorkspaces = useRecoilValue(availableWorkspacesState);
  const availableWorkspacesCount =
    countAvailableWorkspaces(availableWorkspaces);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { closeDropdown } = useCloseDropdown();
  const { signOut } = useAuth();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { colorScheme, colorSchemeList } = useColorScheme();

  const [signUpInNewWorkspaceMutation] = useSignUpInNewWorkspaceMutation();

  const setMultiWorkspaceDropdownState = useSetRecoilState(
    multiWorkspaceDropdownState,
  );

  const handleChange = async (availableWorkspace: AvailableWorkspace) => {
    redirectToWorkspaceDomain(
      getWorkspaceUrl(availableWorkspace.workspaceUrls),
    );
  };

  const createWorkspace = () => {
    signUpInNewWorkspaceMutation({
      onCompleted: async (data) => {
        return await redirectToWorkspaceDomain(
          getWorkspaceUrl(data.signUpInNewWorkspace.workspace.workspaceUrls),
          AppPath.Verify,
          {
            loginToken: data.signUpInNewWorkspace.loginToken.token,
          },
          '_blank',
        );
      },
      onError: (error: ApolloError) => {
        enqueueErrorSnackBar({
          apolloError: error,
        });
      },
    });
  };

  const workspaceCreationEnabled =
    !isWorkspaceCreationLimitedToAdmins || currentUser?.canAccessFullAdminPanel;

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            Avatar={
              <Avatar
                placeholder={currentWorkspace?.displayName || ''}
                avatarUrl={currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO}
              />
            }
          />
        }
        EndComponent={
          workspaceCreationEnabled && (
            <Dropdown
              clickableComponent={
                <LightIconButton
                  Icon={IconDotsVertical}
                  size="small"
                  accent="tertiary"
                />
              }
              dropdownId={'multi-workspace-dropdown-context-menu'}
              dropdownComponents={
                <DropdownContent>
                  <DropdownMenuItemsContainer>
                    <MenuItem
                      LeftIcon={IconPlus}
                      text={t`Create Workspace`}
                      onClick={createWorkspace}
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          )
        }
      >
        {currentWorkspace?.displayName}
      </DropdownMenuHeader>
      {availableWorkspacesCount > 1 && (
        <>
          <DropdownMenuItemsContainer>
            {[
              ...availableWorkspaces.availableWorkspacesForSignIn,
              ...availableWorkspaces.availableWorkspacesForSignUp,
            ]
              .filter(({ id }) => id !== currentWorkspace?.id)
              .slice(0, 3)
              .map((availableWorkspace) => (
                <UndecoratedLink
                  key={availableWorkspace.id}
                  to={buildWorkspaceUrl(
                    getWorkspaceUrl(availableWorkspace.workspaceUrls),
                  )}
                  onClick={(event) => {
                    event?.preventDefault();
                    handleChange(availableWorkspace);
                  }}
                >
                  <MenuItemSelectAvatar
                    text={availableWorkspace.displayName ?? '(No name)'}
                    avatar={
                      <Avatar
                        placeholder={availableWorkspace.displayName || ''}
                        avatarUrl={
                          availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO
                        }
                      />
                    }
                    selected={false}
                  />
                </UndecoratedLink>
              ))}
            {availableWorkspacesCount > 4 && (
              <MenuItem
                LeftIcon={IconSwitchHorizontal}
                text={t`Other workspaces`}
                onClick={() =>
                  setMultiWorkspaceDropdownState('workspaces-list')
                }
                hasSubMenu={true}
              />
            )}
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItemsContainer>
        <MenuItem
          LeftIcon={colorSchemeList.find(({ id }) => id === colorScheme)?.icon}
          text={
            <>
              {t`Theme `}
              <StyledDescription>{` · ${colorScheme}`}</StyledDescription>
            </>
          }
          hasSubMenu={true}
          onClick={() => setMultiWorkspaceDropdownState('themes')}
        />
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.WorkspaceMembersPage)}
          onClick={() => {
            closeDropdown(MULTI_WORKSPACE_DROPDOWN_ID);
          }}
        >
          <MenuItem LeftIcon={IconUserPlus} text={t`Invite user`} />
        </UndecoratedLink>
        <MenuItem LeftIcon={IconLogout} text={t`Log out`} onClick={signOut} />
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

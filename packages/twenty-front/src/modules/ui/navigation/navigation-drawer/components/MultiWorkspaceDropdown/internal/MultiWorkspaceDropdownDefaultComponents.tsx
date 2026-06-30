import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';

import { useMutation } from '@apollo/client/react';
import { useAuth } from '@/auth/hooks/useAuth';
import {
  GET_LOGIN_TOKEN_FOR_WORKSPACE,
  type GetLoginTokenForWorkspaceMutation,
  type GetLoginTokenForWorkspaceMutationVariables,
} from '@/auth/graphql/mutations/getLoginTokenForWorkspace';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  countAvailableWorkspaces,
  getAvailableWorkspacePathAndSearchParams,
} from '@/auth/utils/availableWorkspacesUtils';
import { supportChatState } from '@/client-config/states/supportChatState';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
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
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import {
  IconDotsVertical,
  IconLogout,
  IconMessage,
  IconPlus,
  IconSettings,
  IconSwitchHorizontal,
  IconUserPlus,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import {
  MenuItem,
  MenuItemSelectAvatar,
  UndecoratedLink,
} from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type AvailableWorkspace } from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.light};
  padding-left: ${themeCssVariables.spacing[1]};
`;

export const MultiWorkspaceDropdownDefaultComponents = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { t } = useLingui();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const availableWorkspaces = useAtomStateValue(availableWorkspacesState);
  const availableWorkspacesCount =
    countAvailableWorkspaces(availableWorkspaces);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirectToDefaultDomain } = useRedirectToDefaultDomain();
  const { closeDropdown } = useCloseDropdown();
  const { signOut } = useAuth();
  const { colorScheme, colorSchemeList } = useColorScheme();
  const supportChat = useAtomStateValue(supportChatState);
  const isSupportChatConfigured =
    supportChat?.supportDriver === 'FRONT' &&
    isNonEmptyString(supportChat.supportFrontChatId);
  const [getLoginTokenForWorkspace] = useMutation<
    GetLoginTokenForWorkspaceMutation,
    GetLoginTokenForWorkspaceMutationVariables
  >(GET_LOGIN_TOKEN_FOR_WORKSPACE);

  const setMultiWorkspaceDropdown = useSetAtomState(
    multiWorkspaceDropdownState,
  );

  const { openSettingsMenu } = useOpenSettingsMenu();

  const handleSupport = () => {
    window.FrontChat?.('show');
    closeDropdown(MULTI_WORKSPACE_DROPDOWN_ID);
  };

  const handleChange = async (
    availableWorkspace: AvailableWorkspace,
    shouldUseFreshLoginToken: boolean,
  ) => {
    const workspaceToRedirect = shouldUseFreshLoginToken
      ? await getAvailableWorkspaceWithFreshLoginToken(availableWorkspace)
      : availableWorkspace;
    const { pathname, searchParams } =
      getAvailableWorkspacePathAndSearchParams(workspaceToRedirect);

    redirectToWorkspaceDomain(
      getWorkspaceUrl(workspaceToRedirect.workspaceUrls),
      pathname,
      searchParams,
    );
  };

  const getAvailableWorkspaceWithFreshLoginToken = async (
    availableWorkspace: AvailableWorkspace,
  ): Promise<AvailableWorkspace> => {
    const result = await getLoginTokenForWorkspace({
      variables: {
        workspaceId: availableWorkspace.id,
      },
    });

    const loginToken = result.data?.getLoginTokenForWorkspace.loginToken.token;

    if (!isDefined(loginToken)) {
      throw new Error('Could not generate login token for workspace');
    }

    return {
      ...availableWorkspace,
      loginToken,
    };
  };

  const createWorkspace = () => {
    redirectToDefaultDomain({
      pathname: AppPath.SignInUp,
      searchParams: { action: 'create-new-workspace' },
    });
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            Avatar={
              <Avatar
                placeholder={currentWorkspace?.displayName || ''}
                avatarUrl={getAbsoluteImageUrl(
                  currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
                )}
              />
            }
          />
        }
        EndComponent={
          <Dropdown
            clickableComponent={
              <LightIconButton
                Icon={IconDotsVertical}
                size="small"
                accent="tertiary"
              />
            }
            dropdownId="multi-workspace-dropdown-context-menu"
            dropdownComponents={
              <DropdownContent>
                <DropdownMenuItemsContainer>
                  <MenuItem
                    LeftIcon={IconPlus}
                    text={t`Create Workspace`}
                    onClick={createWorkspace}
                  />
                  <MenuItem
                    LeftIcon={IconLogout}
                    text={t`Log out`}
                    onClick={signOut}
                  />
                </DropdownMenuItemsContainer>
              </DropdownContent>
            }
          />
        }
      >
        {currentWorkspace?.displayName}
      </DropdownMenuHeader>
      {availableWorkspacesCount > 1 && (
        <>
          <DropdownMenuItemsContainer>
            {[
              ...availableWorkspaces.availableWorkspacesForSignIn.map(
                (availableWorkspace) => ({
                  availableWorkspace,
                  shouldUseFreshLoginToken: true,
                }),
              ),
              ...availableWorkspaces.availableWorkspacesForSignUp.map(
                (availableWorkspace) => ({
                  availableWorkspace,
                  shouldUseFreshLoginToken: false,
                }),
              ),
            ]
              .filter(
                ({ availableWorkspace }) =>
                  availableWorkspace.id !== currentWorkspace?.id,
              )
              .slice(0, 3)
              .map(({ availableWorkspace, shouldUseFreshLoginToken }) => {
                const { pathname, searchParams } =
                  getAvailableWorkspacePathAndSearchParams(availableWorkspace);

                return (
                  <UndecoratedLink
                    key={availableWorkspace.id}
                    to={buildWorkspaceUrl(
                      getWorkspaceUrl(availableWorkspace.workspaceUrls),
                      pathname,
                      searchParams,
                    )}
                    onClick={(event) => {
                      event?.preventDefault();
                      void handleChange(
                        availableWorkspace,
                        shouldUseFreshLoginToken,
                      );
                    }}
                  >
                    <MenuItemSelectAvatar
                      text={availableWorkspace.displayName ?? t`(No name)`}
                      avatar={
                        <Avatar
                          placeholder={availableWorkspace.displayName || ''}
                          avatarUrl={getAbsoluteImageUrl(
                            availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO,
                          )}
                        />
                      }
                      selected={false}
                    />
                  </UndecoratedLink>
                );
              })}
            {availableWorkspacesCount > 4 && (
              <MenuItem
                LeftIcon={IconSwitchHorizontal}
                text={t`Other workspaces`}
                onClick={() => setMultiWorkspaceDropdown('workspaces-list')}
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
          onClick={() => setMultiWorkspaceDropdown('themes')}
        />
        <UndecoratedLink
          to={`${getSettingsPath(SettingsPath.WorkspaceMembersPage)}#invite`}
          onClick={() => {
            closeDropdown(MULTI_WORKSPACE_DROPDOWN_ID);
          }}
        >
          <MenuItem LeftIcon={IconUserPlus} text={t`Invite user`} />
        </UndecoratedLink>
        {isSupportChatConfigured && (
          <MenuItem
            LeftIcon={IconMessage}
            text={t`Support`}
            onClick={handleSupport}
          />
        )}
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ProfilePage)}
          onClick={() => {
            openSettingsMenu();
            closeDropdown(MULTI_WORKSPACE_DROPDOWN_ID);
          }}
        >
          <MenuItem LeftIcon={IconSettings} text={t`Settings`} />
        </UndecoratedLink>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

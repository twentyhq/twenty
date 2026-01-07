import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';

import { useAuth } from '@/auth/hooks/useAuth';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { countAvailableWorkspaces } from '@/auth/utils/availableWorkspacesUtils';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { supportChatState } from '@/client-config/states/supportChatState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
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
import { type ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  Avatar,
  IconDotsVertical,
  IconHelpCircle,
  IconLogout,
  IconMessage,
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
  type AvailableWorkspace,
  useSignUpInNewWorkspaceMutation,
} from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

export const MultiWorkspaceDropdownDefaultComponents = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { t } = useLingui();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const availableWorkspaces = useRecoilValue(availableWorkspacesState);
  const availableWorkspacesCount =
    countAvailableWorkspaces(availableWorkspaces);
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { closeDropdown } = useCloseDropdown();
  const { signOut } = useAuth();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { colorScheme, colorSchemeList } = useColorScheme();
  const supportChat = useRecoilValue(supportChatState);
  const isSupportChatConfigured =
    supportChat?.supportDriver === 'FRONT' &&
    isNonEmptyString(supportChat.supportFrontChatId);

  const [signUpInNewWorkspaceMutation] = useSignUpInNewWorkspaceMutation();

  const setMultiWorkspaceDropdownState = useSetRecoilState(
    multiWorkspaceDropdownState,
  );

  const handleSupport = () => {
    window.FrontChat?.('show');
    closeDropdown(MULTI_WORKSPACE_DROPDOWN_ID);
  };

  const handleDocumentation = () => {
    window.open(
      getDocumentationUrl({ locale: currentWorkspaceMember?.locale }),
      '_blank',
    );
    closeDropdown(MULTI_WORKSPACE_DROPDOWN_ID);
  };

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
                    text={availableWorkspace.displayName ?? t`(No name)`}
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
        {isSupportChatConfigured && (
          <MenuItem
            LeftIcon={IconMessage}
            text={t`Support`}
            onClick={handleSupport}
          />
        )}
        <MenuItem
          LeftIcon={IconHelpCircle}
          text={t`Documentation`}
          onClick={handleDocumentation}
        />
        <MenuItem LeftIcon={IconLogout} text={t`Log out`} onClick={signOut} />
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

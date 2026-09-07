import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';

import { useAuth } from '@/auth/hooks/useAuth';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { countAvailableWorkspaces } from '@/auth/utils/availableWorkspacesUtils';
import { supportChatState } from '@/client-config/states/supportChatState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useOpenRecordInPreference } from '@/settings/experience/hooks/useOpenRecordInPreference';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { MULTI_WORKSPACE_DROPDOWN_ID } from '@/ui/navigation/navigation-drawer/constants/MultiWorkspaceDropdownId';
import { OPEN_RECORD_IN_OPTIONS } from '@/ui/navigation/navigation-drawer/constants/OpenRecordInOptions';
import { multiWorkspaceDropdownState } from '@/ui/navigation/navigation-drawer/states/multiWorkspaceDropdownState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
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
import { useIsMobile } from 'twenty-ui/utilities';
import { type AvailableWorkspace } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const MultiWorkspaceDropdownDefaultComponents = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
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

  const setMultiWorkspaceDropdown = useSetAtomState(
    multiWorkspaceDropdownState,
  );

  const { openRecordInPreference } = useOpenRecordInPreference();
  const navigateSettings = useNavigateSettings();

  const isMobile = useIsMobile();
  const canDisplaySidePanel = !isMobile;

  const handleSettings = () => {
    closeDropdown(MULTI_WORKSPACE_DROPDOWN_ID);
    navigateSettings(SettingsPath.ProfilePage);
  };

  const handleSupport = () => {
    window.FrontChat?.('show');
    closeDropdown(MULTI_WORKSPACE_DROPDOWN_ID);
  };

  const handleChange = async (availableWorkspace: AvailableWorkspace) => {
    redirectToWorkspaceDomain(
      getWorkspaceUrl(availableWorkspace.workspaceUrls),
    );
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
                  {isMultiWorkspaceEnabled && (
                    <MenuItem
                      LeftIcon={IconPlus}
                      text={t`Create Workspace`}
                      onClick={createWorkspace}
                    />
                  )}
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
                        avatarUrl={getAbsoluteImageUrl(
                          availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO,
                        )}
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
                onClick={() => setMultiWorkspaceDropdown('workspaces-list')}
                hasSubMenu={true}
              />
            )}
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItemsContainer>
        {/* Desktop reaches settings from the drawer's mode switcher, which
            mobile does not render, so the workspace menu is where it lives. */}
        {isMobile && (
          <MenuItem
            LeftIcon={IconSettings}
            text={t`Settings`}
            onClick={handleSettings}
          />
        )}
        <MenuItem
          LeftIcon={colorSchemeList.find(({ id }) => id === colorScheme)?.icon}
          text={t`Theme`}
          contextualText={colorScheme}
          hasSubMenu={true}
          onClick={() => setMultiWorkspaceDropdown('themes')}
        />
        {canDisplaySidePanel && (
          <MenuItem
            LeftIcon={OPEN_RECORD_IN_OPTIONS[openRecordInPreference].Icon}
            text={t`Open in`}
            contextualText={t(
              OPEN_RECORD_IN_OPTIONS[openRecordInPreference].label,
            )}
            hasSubMenu={true}
            onClick={() => setMultiWorkspaceDropdown('open-record-in')}
          />
        )}
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
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

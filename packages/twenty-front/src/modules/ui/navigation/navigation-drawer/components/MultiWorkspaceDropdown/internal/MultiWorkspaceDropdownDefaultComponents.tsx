import { useAuth } from '@/auth/hooks/useAuth';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { countAvailableWorkspaces } from '@/auth/utils/availableWorkspacesUtils';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useOpenRecordInPreference } from '@/settings/experience/hooks/useOpenRecordInPreference';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
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
import { LightIconButton } from 'twenty-ui/components';
import {
  IconDotsVertical,
  IconLogout,
  IconMessage,
  IconPlus,
  IconSettings,
  IconSwitchHorizontal,
  IconUserPlus,
} from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';
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
    <LegacyDropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            Avatar={
              <Avatar
                name={currentWorkspace?.displayName || ''}
                src={getAbsoluteImageUrl(
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
                size="sm"
                emphasis="subtle"
                aria-label={t`More options`}
              >
                <IconDotsVertical />
              </LightIconButton>
            }
            dropdownId="multi-workspace-dropdown-context-menu"
            dropdownComponents={
              <LegacyDropdownContent>
                <DropdownMenuItemsContainer>
                  {isMultiWorkspaceEnabled && (
                    <ListItem
                      startIcon={<IconPlus />}
                      onClick={createWorkspace}
                    >{t`Create Workspace`}</ListItem>
                  )}
                  <ListItem
                    startIcon={<IconLogout />}
                    onClick={signOut}
                  >{t`Log out`}</ListItem>
                </DropdownMenuItemsContainer>
              </LegacyDropdownContent>
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
                  <ListItem
                    role="option"
                    aria-selected={false}
                    selected={false}
                    indicator="check"
                    startIcon={
                      <Avatar
                        name={availableWorkspace.displayName || ''}
                        src={getAbsoluteImageUrl(
                          availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO,
                        )}
                      />
                    }
                  >
                    {availableWorkspace.displayName ?? t`(No name)`}
                  </ListItem>
                </UndecoratedLink>
              ))}
            {availableWorkspacesCount > 4 && (
              <ListItem
                startIcon={<IconSwitchHorizontal />}
                onClick={() => setMultiWorkspaceDropdown('workspaces-list')}
                hasSubmenu
              >{t`Other workspaces`}</ListItem>
            )}
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuItemsContainer>
        {/* Desktop reaches settings from the drawer's mode switcher, which
            mobile does not render, so the workspace menu is where it lives. */}
        {isMobile && (
          <ListItem
            startIcon={<IconSettings />}
            onClick={handleSettings}
          >{t`Settings`}</ListItem>
        )}
        <ListItem
          startIcon={
            <SelectOptionIcon
              Icon={colorSchemeList.find(({ id }) => id === colorScheme)?.icon}
            />
          }
          description={colorScheme}
          hasSubmenu
          onClick={() => setMultiWorkspaceDropdown('themes')}
        >{t`Theme`}</ListItem>
        {canDisplaySidePanel && (
          <ListItem
            startIcon={
              <SelectOptionIcon
                Icon={OPEN_RECORD_IN_OPTIONS[openRecordInPreference].Icon}
              />
            }
            description={t(
              OPEN_RECORD_IN_OPTIONS[openRecordInPreference].label,
            )}
            hasSubmenu
            onClick={() => setMultiWorkspaceDropdown('open-record-in')}
          >{t`Open in`}</ListItem>
        )}
        <UndecoratedLink
          to={`${getSettingsPath(SettingsPath.WorkspaceMembersPage)}#invite`}
          onClick={() => {
            closeDropdown(MULTI_WORKSPACE_DROPDOWN_ID);
          }}
        >
          <ListItem startIcon={<IconUserPlus />}>{t`Invite user`}</ListItem>
        </UndecoratedLink>
        {isSupportChatConfigured && (
          <ListItem
            startIcon={<IconMessage />}
            onClick={handleSupport}
          >{t`Support`}</ListItem>
        )}
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};

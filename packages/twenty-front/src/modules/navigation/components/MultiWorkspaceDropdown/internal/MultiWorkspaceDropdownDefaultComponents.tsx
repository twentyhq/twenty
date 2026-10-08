import { useAuth } from '@/auth/hooks/useAuth';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { countAvailableWorkspaces } from '@/auth/utils/availableWorkspacesUtils';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
import { useOpenRecordInPreference } from '@/settings/experience/hooks/useOpenRecordInPreference';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { AvailableWorkspaceItem } from '@/navigation/components/MultiWorkspaceDropdown/internal/components/AvailableWorkspaceItem';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { OPEN_RECORD_IN_OPTIONS } from '@/navigation/constants/OpenRecordInOptions';
import { useColorScheme } from '@/workspace-member/hooks/useColorScheme';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceAvatarColorSeed } from '@/workspace/utils/getWorkspaceAvatarColorSeed';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Link } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
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
import { useIsMobile } from 'twenty-ui/utilities';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const MultiWorkspaceDropdownDefaultComponents = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const { t } = useLingui();
  const availableWorkspaces = useAtomStateValue(availableWorkspacesState);
  const availableWorkspacesCount =
    countAvailableWorkspaces(availableWorkspaces);
  const { redirectToDefaultDomain } = useRedirectToDefaultDomain();
  const { signOut } = useAuth();
  const { colorScheme, colorSchemeList } = useColorScheme();
  const supportChat = useAtomStateValue(supportChatState);
  const isSupportChatConfigured =
    supportChat?.supportDriver === 'FRONT' &&
    isNonEmptyString(supportChat.supportFrontChatId);
  const { openRecordInPreference } = useOpenRecordInPreference();
  const navigateSettings = useNavigateSettings();
  const isMobile = useIsMobile();
  const canDisplaySidePanel = !isMobile;

  const handleSettings = () => {
    navigateSettings(SettingsPath.ProfilePage);
  };

  const handleSupport = () => {
    window.FrontChat?.('show');
  };

  const createWorkspace = () => {
    redirectToDefaultDomain({
      pathname: AppPath.SignInUp,
      searchParams: { action: 'create-new-workspace' },
    });
  };

  return (
    <>
      <Dropdown.Header>
        <Avatar
          name={currentWorkspace?.displayName || ''}
          colorSeed={getWorkspaceAvatarColorSeed(currentWorkspace?.displayName)}
          src={getAbsoluteImageUrl(
            currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
          )}
        />
        <Dropdown.Title>{currentWorkspace?.displayName}</Dropdown.Title>
        <DropdownRoot
          dropdownId="multi-workspace-dropdown-context-menu"
          type="menu"
        >
          <Dropdown.Trigger
            render={
              <LightIconButton
                size="sm"
                emphasis="subtle"
                aria-label={t`More options`}
              >
                <IconDotsVertical />
              </LightIconButton>
            }
          />
          <DropdownContent align="end">
            <Dropdown.Section>
              {isMultiWorkspaceEnabled && (
                <Dropdown.ActionItem
                  startIcon={<IconPlus />}
                  onClick={createWorkspace}
                >
                  {t`Create Workspace`}
                </Dropdown.ActionItem>
              )}
              <Dropdown.ActionItem startIcon={<IconLogout />} onClick={signOut}>
                {t`Log out`}
              </Dropdown.ActionItem>
            </Dropdown.Section>
          </DropdownContent>
        </DropdownRoot>
      </Dropdown.Header>
      {availableWorkspacesCount > 1 && (
        <>
          <Dropdown.Section>
            {[
              ...availableWorkspaces.availableWorkspacesForSignIn,
              ...availableWorkspaces.availableWorkspacesForSignUp,
            ]
              .filter(({ id }) => id !== currentWorkspace?.id)
              .slice(0, 3)
              .map((availableWorkspace) => (
                <AvailableWorkspaceItem
                  key={availableWorkspace.id}
                  availableWorkspace={availableWorkspace}
                  isSelected={false}
                />
              ))}
            {availableWorkspacesCount > 4 && (
              <Dropdown.ActionItem
                startIcon={<IconSwitchHorizontal />}
                page="workspaces-list"
              >
                {t`Other workspaces`}
              </Dropdown.ActionItem>
            )}
          </Dropdown.Section>
          <Dropdown.Separator />
        </>
      )}
      <Dropdown.Section>
        {isMobile && (
          <Dropdown.ActionItem
            startIcon={<IconSettings />}
            onClick={handleSettings}
          >
            {t`Settings`}
          </Dropdown.ActionItem>
        )}
        <Dropdown.ActionItem
          startIcon={
            <SelectOptionIcon
              Icon={colorSchemeList.find(({ id }) => id === colorScheme)?.icon}
            />
          }
          description={colorScheme}
          page="themes"
        >
          {t`Theme`}
        </Dropdown.ActionItem>
        {canDisplaySidePanel && (
          <Dropdown.ActionItem
            startIcon={
              <SelectOptionIcon
                Icon={OPEN_RECORD_IN_OPTIONS[openRecordInPreference].Icon}
              />
            }
            description={t(
              OPEN_RECORD_IN_OPTIONS[openRecordInPreference].label,
            )}
            page="open-record-in"
          >
            {t`Open in`}
          </Dropdown.ActionItem>
        )}
        <Dropdown.ActionItem
          render={
            <Link
              to={`${getSettingsPath(SettingsPath.WorkspaceMembersPage)}#invite`}
            />
          }
          startIcon={<IconUserPlus />}
        >
          {t`Invite user`}
        </Dropdown.ActionItem>
        {isSupportChatConfigured && (
          <Dropdown.ActionItem
            startIcon={<IconMessage />}
            onClick={handleSupport}
          >
            {t`Support`}
          </Dropdown.ActionItem>
        )}
      </Dropdown.Section>
    </>
  );
};

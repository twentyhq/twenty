import { MainNavigationDrawerTabsRow } from '@/navigation/components/MainNavigationDrawerTabsRow';
import { NavigationDrawerTabbedContent } from '@/navigation/components/NavigationDrawerTabbedContent';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useIsMobile } from 'twenty-ui-deprecated/utilities';
import { AdvancedSettingsToggle } from 'twenty-ui-deprecated/navigation';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledAdvancedToggleWrapper = styled.div<{ isMobile: boolean }>`
  padding-right: ${({ isMobile }) =>
    isMobile ? '0' : themeCssVariables.spacing[1]};
`;

export const SettingsNavigationDrawer = ({
  className,
}: {
  className?: string;
}) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useAtomState(
    isAdvancedModeEnabledState,
  );
  const navigationDrawerActiveTab = useAtomStateValue(
    navigationDrawerActiveTabState,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const showAiChatContent =
    hasAiPermission &&
    navigationDrawerActiveTab === NAVIGATION_DRAWER_TABS.AI_CHAT_HISTORY;

  return (
    <NavigationDrawer className={className} title={t`Exit Settings`}>
      {hasAiPermission && (
        <NavigationDrawerFixedContent>
          <MainNavigationDrawerTabsRow />
        </NavigationDrawerFixedContent>
      )}

      <NavigationDrawerScrollableContent>
        <NavigationDrawerTabbedContent
          showAiChatContent={showAiChatContent}
          navigationContent={<SettingsNavigationDrawerItems />}
        />
      </NavigationDrawerScrollableContent>

      {!showAiChatContent && (
        <NavigationDrawerFixedContent>
          <StyledAdvancedToggleWrapper isMobile={isMobile}>
            <AdvancedSettingsToggle
              isAdvancedModeEnabled={isAdvancedModeEnabled}
              setIsAdvancedModeEnabled={setIsAdvancedModeEnabled}
              label={t`Advanced`}
            />
          </StyledAdvancedToggleWrapper>
        </NavigationDrawerFixedContent>
      )}
    </NavigationDrawer>
  );
};

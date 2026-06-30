import { MainNavigationDrawerTabsRow } from '@/navigation/components/MainNavigationDrawerTabsRow';
import { NavigationDrawerTabbedContent } from '@/navigation/components/NavigationDrawerTabbedContent';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { navigationDrawerActiveTabState } from '@/ui/navigation/states/navigationDrawerActiveTabState';
import { NAVIGATION_DRAWER_TABS } from '@/ui/navigation/states/navigationDrawerTabs';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useIsMobile } from 'twenty-ui/utilities';
import { AdvancedSettingsToggle } from 'twenty-ui/input';
import { IconSettings } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledAdvancedToggleFixedContent = styled.div<{ isMobile: boolean }>`
  flex-shrink: 0;
  margin-top: auto;
  padding-left: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
  padding-right: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[5] : '0'};
`;

const advancedSettingsToggleClassName = css`
  padding-right: 0;
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
    <NavigationDrawer className={className} title={t`Settings`}>
      {hasAiPermission && (
        <NavigationDrawerFixedContent>
          <MainNavigationDrawerTabsRow
            NavigationMenuTabIcon={IconSettings}
            navigationMenuTabLabel={t`Settings`}
          />
        </NavigationDrawerFixedContent>
      )}

      <NavigationDrawerScrollableContent>
        <NavigationDrawerTabbedContent
          showAiChatContent={showAiChatContent}
          shouldMountAiChatContent={hasAiPermission}
          navigationContent={<SettingsNavigationDrawerItems />}
        />
      </NavigationDrawerScrollableContent>

      {!showAiChatContent && (
        <StyledAdvancedToggleFixedContent isMobile={isMobile}>
          <NavigationDrawerSection>
            <AdvancedSettingsToggle
              className={advancedSettingsToggleClassName}
              isAdvancedModeEnabled={isAdvancedModeEnabled}
              setIsAdvancedModeEnabled={setIsAdvancedModeEnabled}
              label={t`Advanced`}
            />
          </NavigationDrawerSection>
        </StyledAdvancedToggleFixedContent>
      )}
    </NavigationDrawer>
  );
};

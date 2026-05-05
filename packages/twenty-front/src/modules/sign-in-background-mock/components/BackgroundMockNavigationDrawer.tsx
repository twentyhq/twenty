import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconSearch, IconSettings } from 'twenty-ui/display';
import { getOsControlSymbol, useIsMobile } from 'twenty-ui/utilities';

import { BACKGROUND_MOCK_OTHER_ITEMS } from '@/sign-in-background-mock/constants/BackgroundMockOtherItems';
import { BACKGROUND_MOCK_WORKSPACE_ITEMS } from '@/sign-in-background-mock/constants/BackgroundMockNavigationItems';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { DEFAULT_WORKSPACE_NAME } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName';

const StyledMainSectionWrapper = styled.div`
  min-height: fit-content;
`;

export type BackgroundMockNavigationDrawerProps = {
  className?: string;
};

export const BackgroundMockNavigationDrawer = ({
  className,
}: BackgroundMockNavigationDrawerProps) => {
  const isMobile = useIsMobile();
  const { t } = useLingui();

  return (
    <NavigationDrawer className={className} title={DEFAULT_WORKSPACE_NAME}>
      {!isMobile && (
        <StyledMainSectionWrapper>
          <NavigationDrawerSection>
            <NavigationDrawerItem
              label={t`Search`}
              Icon={IconSearch}
              onClick={() => {}}
              modifier={{ keyboard: [getOsControlSymbol(), 'K'] }}
            />
            <NavigationDrawerItem
              label={t`Settings`}
              to={getSettingsPath(SettingsPath.ProfilePage)}
              onClick={() => {}}
              Icon={IconSettings}
            />
          </NavigationDrawerSection>
        </StyledMainSectionWrapper>
      )}
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label={t`Workspace`} />
        {BACKGROUND_MOCK_WORKSPACE_ITEMS.map((item, index) => (
          <NavigationDrawerItem
            key={item.label}
            label={item.label}
            Icon={item.Icon}
            iconColor={item.color}
            active={index === 0}
            onClick={() => {}}
          />
        ))}
      </NavigationDrawerSection>
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle label={t`Other`} />
        {BACKGROUND_MOCK_OTHER_ITEMS.map((item) => (
          <NavigationDrawerItem
            key={item.label}
            label={item.label}
            Icon={item.Icon}
            onClick={() => {}}
          />
        ))}
      </NavigationDrawerSection>
    </NavigationDrawer>
  );
};

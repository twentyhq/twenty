import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useLingui } from '@lingui/react/macro';
import { useMatch } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconRocket, type TablerIconsProps } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

export const GettingStartedOpenedSection = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const isGettingStartedPageOpen = isDefined(useMatch(AppPath.GettingStarted));

  if (!isGettingStartedPageOpen) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle label={t`Opened`} />
      </NavigationDrawerAnimatedCollapseWrapper>
      <NavigationDrawerItem
        label={t`Getting started`}
        to={AppPath.GettingStarted}
        Icon={({ size, stroke }: TablerIconsProps) => (
          <IconRocket
            size={size}
            stroke={stroke}
            color={theme.tag.text.purple}
          />
        )}
        active
      />
    </NavigationDrawerSection>
  );
};

import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  IconBox,
  IconBriefcase,
  IconChartBar,
  IconCoins,
  IconFileText,
  IconFlag,
  IconHeadphones,
  IconPhone,
  IconPresentation,
  IconRobot,
  IconSettings,
  IconShield,
  IconUsers,
} from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const ENTERPRISE_SECTION_ID = 'Enterprise';

type EnterpriseNavItem = {
  label: string;
  path: string;
  Icon: typeof IconBox;
};

export const EnterpriseNavigationSection = () => {
  const { t } = useLingui();
  const location = useLocation();

  const { toggleNavigationSection } = useNavigationSection(
    ENTERPRISE_SECTION_ID,
  );
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    ENTERPRISE_SECTION_ID,
  );

  const settingsPrefix = '/settings/';

  const enterpriseNavItems: EnterpriseNavItem[] = [
    {
      label: t`Helpdesk`,
      path: settingsPrefix + 'modules/support_ticket',
      Icon: IconHeadphones,
    },
    {
      label: t`Inventory`,
      path: settingsPrefix + SettingsPath.EnterpriseInventory,
      Icon: IconBox,
    },
    {
      label: t`Finance`,
      path: settingsPrefix + SettingsPath.EnterpriseAccounting,
      Icon: IconCoins,
    },
    {
      label: t`HRM`,
      path: settingsPrefix + SettingsPath.EnterpriseHRM,
      Icon: IconUsers,
    },
    {
      label: t`Projects`,
      path: settingsPrefix + SettingsPath.EnterpriseProjects,
      Icon: IconChartBar,
    },
    {
      label: t`Fleet`,
      path: settingsPrefix + SettingsPath.EnterpriseFleet,
      Icon: IconPresentation,
    },
    {
      label: t`E-Commerce`,
      path: settingsPrefix + SettingsPath.EnterpriseECommerce,
      Icon: IconBriefcase,
    },
    {
      label: t`Partners`,
      path: settingsPrefix + SettingsPath.EnterprisePRM,
      Icon: IconUsers,
    },
    {
      label: t`Contracts`,
      path: settingsPrefix + SettingsPath.EnterpriseCLM,
      Icon: IconFileText,
    },
    {
      label: t`VoIP`,
      path: settingsPrefix + SettingsPath.EnterpriseVoIP,
      Icon: IconPhone,
    },
    {
      label: t`AI Agents`,
      path: settingsPrefix + SettingsPath.EnterpriseAI,
      Icon: IconRobot,
    },
    {
      label: t`Security`,
      path: settingsPrefix + 'modules/security',
      Icon: IconShield,
    },
    {
      label: t`Feature Flags`,
      path: settingsPrefix + 'modules/feature-flags',
      Icon: IconFlag,
    },
    {
      label: t`All Modules`,
      path: settingsPrefix + SettingsPath.EnterpriseModules,
      Icon: IconSettings,
    },
  ];

  const isItemActive = (itemPath: string) => {
    return location.pathname.startsWith(itemPath);
  };

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={t`Enterprise`}
          onClick={toggleNavigationSection}
          isOpen={isNavigationSectionOpen}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      <AnimatedExpandableContainer
        isExpanded={isNavigationSectionOpen}
        dimension="height"
        mode="fit-content"
        containAnimation
        initial={false}
      >
        {enterpriseNavItems.map((item) => (
          <NavigationDrawerItem
            key={item.path}
            label={item.label}
            Icon={item.Icon}
            to={item.path}
            active={isItemActive(item.path)}
          />
        ))}
      </AnimatedExpandableContainer>
    </NavigationDrawerSection>
  );
};

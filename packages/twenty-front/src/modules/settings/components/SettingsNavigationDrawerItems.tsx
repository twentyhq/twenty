import { useRecoilValue } from 'recoil';
import {
  ANIMATION,
  IconApps,
  IconAt,
  IconCalendarEvent,
  IconCode,
  IconColorSwatch,
  IconComponent,
  IconCurrencyDollar,
  IconDoorEnter,
  IconFunction,
  IconHierarchy2,
  IconMail,
  IconRocket,
  IconSettings,
  IconTool,
  IconUserCircle,
  IconUsers,
  MAIN_COLORS,
} from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { billingState } from '@/client-config/states/billingState';
import { SettingsNavigationDrawerItem } from '@/settings/components/SettingsNavigationDrawerItem';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import {
  NavigationDrawerItem,
  NavigationDrawerItemIndentationLevel,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { getNavigationSubItemState } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { matchPath, resolvePath, useLocation } from 'react-router-dom';

const StyledNavigationDrawerSection = styled(NavigationDrawerSection)<{
  withLeftMargin?: boolean;
}>`
  margin-left: ${({ withLeftMargin, theme }) =>
    withLeftMargin && theme.spacing(5)};
`;

const StyledIconContainer = styled.div`
  border-right: 1px solid ${MAIN_COLORS.yellow};
  display: flex;
  margin-top: ${({ theme }) => theme.spacing(2)};
  width: 16px;
`;

const StyledDeveloperSection = styled.div`
  display: flex;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconTool = styled(IconTool)`
  margin-right: 3px;
`;

const StyledAdvancedSection = styled(motion.div)`
  display: flex;
  width: 100%;
`;

type SettingsNavigationItem = {
  label: string;
  path: SettingsPath;
  Icon: IconComponent;
  matchSubPages?: boolean;
  indentationLevel?: NavigationDrawerItemIndentationLevel;
};

const advancedSectionAnimationConfig = {
  initial: {
    opacity: 0,
    height: 0,
  },
  animate: {
    opacity: 1,
    height: 'auto',
  },
};

export const SettingsNavigationDrawerItems = () => {
  const { signOut } = useAuth();

  const billing = useRecoilValue(billingState);
  const isFunctionSettingsEnabled = useIsFeatureEnabled(
    'IS_FUNCTION_SETTINGS_ENABLED',
  );
  const isFreeAccessEnabled = useIsFeatureEnabled('IS_FREE_ACCESS_ENABLED');
  const isCRMMigrationEnabled = useIsFeatureEnabled('IS_CRM_MIGRATION_ENABLED');
  const isBillingPageEnabled =
    billing?.isBillingEnabled && !isFreeAccessEnabled;

  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);

  // TODO: Refactor this part to only have arrays of navigation items
  const currentPathName = useLocation().pathname;

  const accountSubSettings: SettingsNavigationItem[] = [
    {
      label: 'Emails',
      path: SettingsPath.AccountsEmails,
      Icon: IconMail,
      matchSubPages: true,
      indentationLevel: 2,
    },
    {
      label: 'Calendars',
      path: SettingsPath.AccountsCalendars,
      Icon: IconCalendarEvent,
      matchSubPages: true,
      indentationLevel: 2,
    },
  ];

  const selectedIndex = accountSubSettings.findIndex((accountSubSetting) => {
    const href = getSettingsPagePath(accountSubSetting.path);
    const pathName = resolvePath(href).pathname;

    return matchPath(
      {
        path: pathName,
        end: !accountSubSetting.matchSubPages,
      },
      currentPathName,
    );
  });

  return (
    <>
      <StyledNavigationDrawerSection withLeftMargin>
        <NavigationDrawerSectionTitle label="User" />
        <SettingsNavigationDrawerItem
          label="Profile"
          path={SettingsPath.ProfilePage}
          Icon={IconUserCircle}
        />
        <SettingsNavigationDrawerItem
          label="Experience"
          path={SettingsPath.Appearance}
          Icon={IconColorSwatch}
        />
        <NavigationDrawerItemGroup>
          <SettingsNavigationDrawerItem
            label="Accounts"
            path={SettingsPath.Accounts}
            Icon={IconAt}
          />
          {accountSubSettings.map((navigationItem, index) => (
            <SettingsNavigationDrawerItem
              key={index}
              label={navigationItem.label}
              path={navigationItem.path}
              Icon={navigationItem.Icon}
              indentationLevel={navigationItem.indentationLevel}
              subItemState={getNavigationSubItemState({
                arrayLength: accountSubSettings.length,
                index,
                selectedIndex,
              })}
            />
          ))}
        </NavigationDrawerItemGroup>
      </StyledNavigationDrawerSection>
      <StyledNavigationDrawerSection withLeftMargin>
        <NavigationDrawerSectionTitle label="Workspace" />
        <SettingsNavigationDrawerItem
          label="General"
          path={SettingsPath.Workspace}
          Icon={IconSettings}
        />
        <SettingsNavigationDrawerItem
          label="Members"
          path={SettingsPath.WorkspaceMembersPage}
          Icon={IconUsers}
        />
        {isBillingPageEnabled && (
          <SettingsNavigationDrawerItem
            label="Billing"
            path={SettingsPath.Billing}
            Icon={IconCurrencyDollar}
          />
        )}
        <SettingsNavigationDrawerItem
          label="Data model"
          path={SettingsPath.Objects}
          Icon={IconHierarchy2}
          matchSubPages
        />
        <SettingsNavigationDrawerItem
          label="Integrations"
          path={SettingsPath.Integrations}
          Icon={IconApps}
        />
        {isCRMMigrationEnabled && (
          <SettingsNavigationDrawerItem
            label="CRM Migration"
            path={SettingsPath.CRMMigration}
            Icon={IconCode}
          />
        )}
      </StyledNavigationDrawerSection>
      <AnimatePresence>
        {isAdvancedModeEnabled && (
          <StyledAdvancedSection
            initial={advancedSectionAnimationConfig.initial}
            animate={advancedSectionAnimationConfig.animate}
            exit={advancedSectionAnimationConfig.initial}
            transition={{
              duration: ANIMATION.duration.normal,
            }}
          >
            <StyledDeveloperSection>
              <StyledIconContainer>
                <StyledIconTool size={12} color={MAIN_COLORS.yellow} />
              </StyledIconContainer>
              <StyledNavigationDrawerSection>
                <NavigationDrawerSectionTitle label="Developers" />
                <SettingsNavigationDrawerItem
                  label="API & Webhooks"
                  path={SettingsPath.Developers}
                  Icon={IconCode}
                />
                {isFunctionSettingsEnabled && (
                  <SettingsNavigationDrawerItem
                    label="Functions"
                    path={SettingsPath.ServerlessFunctions}
                    Icon={IconFunction}
                  />
                )}
              </StyledNavigationDrawerSection>
            </StyledDeveloperSection>
          </StyledAdvancedSection>
        )}
      </AnimatePresence>
      <StyledNavigationDrawerSection withLeftMargin>
        <NavigationDrawerSectionTitle label="Other" />
        <SettingsNavigationDrawerItem
          label="Releases"
          path={SettingsPath.Releases}
          Icon={IconRocket}
        />
        <NavigationDrawerItem
          label="Logout"
          onClick={signOut}
          Icon={IconDoorEnter}
        />
      </StyledNavigationDrawerSection>
    </>
  );
};

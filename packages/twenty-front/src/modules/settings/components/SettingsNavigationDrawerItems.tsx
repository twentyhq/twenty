import { useRecoilValue } from 'recoil';
import {
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
import { useExpandedHeightAnimation } from '@/settings/hooks/useExpandedHeightAnimation';
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

type SettingsNavigationItem = {
  label: string;
  path: SettingsPath;
  Icon: IconComponent;
  indentationLevel?: NavigationDrawerItemIndentationLevel;
  matchSubPages?: boolean;
};

const StyledIconContainer = styled.div`
  border-right: 1px solid ${MAIN_COLORS.yellow};
  position: absolute;
  left: ${({ theme }) => theme.spacing(-5)};
  margin-top: ${({ theme }) => theme.spacing(2)};
  height: 75%;
`;

const StyledDeveloperSection = styled.div`
  display: flex;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(1)};
  position: relative;
`;

const StyledIconTool = styled(IconTool)`
  margin-right: ${({ theme }) => theme.spacing(0.5)};
`;

export const SettingsNavigationDrawerItems = () => {
  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);
  const { contentRef, motionAnimationVariants } = useExpandedHeightAnimation(
    isAdvancedModeEnabled,
  );
  const { signOut } = useAuth();

  const billing = useRecoilValue(billingState);
  const isFunctionSettingsEnabled = useIsFeatureEnabled(
    'IS_FUNCTION_SETTINGS_ENABLED',
  );
  const isFreeAccessEnabled = useIsFeatureEnabled('IS_FREE_ACCESS_ENABLED');
  const isCRMMigrationEnabled = useIsFeatureEnabled('IS_CRM_MIGRATION_ENABLED');
  const isBillingPageEnabled =
    billing?.isBillingEnabled && !isFreeAccessEnabled;

  // TODO: Refactor this part to only have arrays of navigation items
  const currentPathName = useLocation().pathname;

  const accountSubSettings: SettingsNavigationItem[] = [
    {
      label: 'Emails',
      path: SettingsPath.AccountsEmails,
      Icon: IconMail,
      indentationLevel: 2,
    },
    {
      label: 'Calendars',
      path: SettingsPath.AccountsCalendars,
      Icon: IconCalendarEvent,
      indentationLevel: 2,
    },
  ];

  const selectedIndex = accountSubSettings.findIndex((accountSubSetting) => {
    const href = getSettingsPagePath(accountSubSetting.path);
    const pathName = resolvePath(href).pathname;

    return matchPath(
      {
        path: pathName,
        end: accountSubSetting.matchSubPages === false,
      },
      currentPathName,
    );
  });

  return (
    <>
      <NavigationDrawerSection>
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
            matchSubPages={false}
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
      </NavigationDrawerSection>
      <NavigationDrawerSection>
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
      </NavigationDrawerSection>
      <AnimatePresence>
        {isAdvancedModeEnabled && (
          <motion.div
            ref={contentRef}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={motionAnimationVariants}
          >
            <StyledDeveloperSection>
              <StyledIconContainer>
                <StyledIconTool size={12} color={MAIN_COLORS.yellow} />
              </StyledIconContainer>
              <NavigationDrawerSection>
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
              </NavigationDrawerSection>
            </StyledDeveloperSection>
          </motion.div>
        )}
      </AnimatePresence>
      <NavigationDrawerSection>
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
      </NavigationDrawerSection>
    </>
  );
};

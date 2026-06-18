import { useLingui } from '@lingui/react/macro';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import {
  IconBroadcast,
  IconCalendarEvent,
  IconFileText,
  IconHelpCircle,
  IconSettings,
  IconUsers,
} from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

// Propel: the graduated Marketing Home hub and the 1:1 Runner hub nav entries are
// gated behind a build/runtime flag so they only appear where the engine image
// enables them. Same dual mechanism as the dialer dock (window._env_ for the Docker
// runtime injection, import.meta.env for vite dev). The /marketing and /one-on-one
// routes themselves register unconditionally (they simply 404 when nav-hidden); only
// these nav items are gated.
const PROPEL_MARKETING_HUB_ENABLED =
  Boolean(window._env_?.REACT_APP_PROPEL_MARKETING_HUB) ||
  Boolean(import.meta.env.REACT_APP_PROPEL_MARKETING_HUB);

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const NavigationDrawerOtherSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { toggleNavigationSection } = useNavigationSection('Other');
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    'Other',
  );

  const handleSettingsClick = () => {
    navigateSettings(SettingsPath.ProfilePage);
  };

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={t`Other`}
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
        {/* Propel: plain string labels (NOT the t`` macro). These are
            Propel-custom strings absent from the compiled Lingui catalog, so the
            macro renders the hashed message id at runtime ("vo2a+a" / "4T6rI4")
            instead of the text. The CRM is English-only, so a literal is correct
            and catalog-independent. Do not "restore" the t`` macro. */}
        {PROPEL_MARKETING_HUB_ENABLED && (
          <NavigationDrawerItem
            label="Marketing"
            to={AppPath.MarketingHub}
            Icon={IconBroadcast}
          />
        )}
        {PROPEL_MARKETING_HUB_ENABLED && (
          <NavigationDrawerItem
            label="Social Calendar"
            to={AppPath.MarketingSocialCalendar}
            Icon={IconCalendarEvent}
          />
        )}
        {PROPEL_MARKETING_HUB_ENABLED && (
          <NavigationDrawerItem
            label="Weekly 1:1"
            to={AppPath.OneOnOneRunner}
            Icon={IconUsers}
          />
        )}
        {PROPEL_MARKETING_HUB_ENABLED && (
          <NavigationDrawerItem
            label="A2A Studio"
            to={AppPath.A2AStudio}
            Icon={IconFileText}
          />
        )}
        <NavigationDrawerItem
          label={t`Settings`}
          Icon={IconSettings}
          onClick={handleSettingsClick}
        />
        <NavigationDrawerItem
          label={t`Documentation`}
          to={getDocumentationUrl({
            locale: currentWorkspaceMember?.locale,
          })}
          Icon={IconHelpCircle}
        />
      </AnimatedExpandableContainer>
    </NavigationDrawerSection>
  );
};

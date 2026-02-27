import { useLingui } from '@lingui/react/macro';
import { useLocation, useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconHelpCircle, IconSettings } from 'twenty-ui/display';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedState } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedState';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const NavigationDrawerOtherSection = () => {
  const { t } = useLingui();
  const location = useLocation();
  const navigate = useNavigate();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useAtomState(isNavigationDrawerExpandedState);
  const setNavigationDrawerExpandedMemorized = useSetAtomState(
    navigationDrawerExpandedMemorizedState,
  );
  const setNavigationMemorizedUrl = useSetAtomState(
    navigationMemorizedUrlState,
  );

  const { toggleNavigationSection } = useNavigationSection('Other');
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    'Other',
  );

  const handleSettingsClick = () => {
    setNavigationDrawerExpandedMemorized(isNavigationDrawerExpanded);
    setIsNavigationDrawerExpanded(true);
    setNavigationMemorizedUrl(location.pathname + location.search);
    navigate(getSettingsPath(SettingsPath.ProfilePage));
  };

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={t`Other`}
          onClick={toggleNavigationSection}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      {isNavigationSectionOpen && (
        <>
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
        </>
      )}
    </NavigationDrawerSection>
  );
};

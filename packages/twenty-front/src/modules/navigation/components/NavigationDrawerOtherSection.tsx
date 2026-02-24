import { useLingui } from '@lingui/react/macro';
import { useLocation, useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconHelpCircle, IconSettings } from 'twenty-ui/display';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedStateV2 } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedStateV2';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';

export const NavigationDrawerOtherSection = () => {
  const { t } = useLingui();
  const location = useLocation();
  const navigate = useNavigate();
  const currentWorkspaceMember = useRecoilValueV2(currentWorkspaceMemberState);
  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilStateV2(isNavigationDrawerExpandedState);
  const setNavigationDrawerExpandedMemorized = useSetRecoilStateV2(
    navigationDrawerExpandedMemorizedStateV2,
  );
  const setNavigationMemorizedUrl = useSetRecoilStateV2(
    navigationMemorizedUrlState,
  );

  const { toggleNavigationSection } = useNavigationSection('Other');
  const isNavigationSectionOpen = useFamilyRecoilValueV2(
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

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { useIsMatchingLocation } from '../hooks/useIsMatchingLocation';
import { useEventTracker } from '../modules/analytics/hooks/useEventTracker';
import { useOnboardingStatus } from '../modules/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '../modules/auth/utils/getOnboardingStatus';
import { AppBasePath } from '../modules/types/AppBasePath';
import { AppPath } from '../modules/types/AppPath';
import { PageHotkeyScope } from '../modules/types/PageHotkeyScope';
import { SettingsPath } from '../modules/types/SettingsPath';
import { useSetHotkeyScope } from '../modules/ui/hotkey/hooks/useSetHotkeyScope';
import { currentPageLocationState } from '../modules/ui/states/currentPageLocationState';
import { TableHotkeyScope } from '../modules/ui/table/types/TableHotkeyScope';

export function AuthAutoRouter() {
  const navigate = useNavigate();
  const isMatchingLocation = useIsMatchingLocation();

  const onboardingStatus = useOnboardingStatus();

  const setHotkeyScope = useSetHotkeyScope();

  const location = useLocation();

  const eventTracker = useEventTracker();

  useEffect(() => {
    console.log('DefaultLayout: useEffect', { onboardingStatus });
    const isMachinOngoingUserCreationRoute =
      isMatchingLocation(AppPath.SignUp) ||
      isMatchingLocation(AppPath.SignIn) ||
      isMatchingLocation(AppPath.Invite) ||
      isMatchingLocation(AppPath.Verify);

    const isMatchingOnboardingRoute =
      isMatchingLocation(AppPath.SignUp) ||
      isMatchingLocation(AppPath.SignIn) ||
      isMatchingLocation(AppPath.Invite) ||
      isMatchingLocation(AppPath.Verify) ||
      isMatchingLocation(AppPath.CreateWorkspace) ||
      isMatchingLocation(AppPath.CreateProfile);

    if (
      onboardingStatus === OnboardingStatus.OngoingUserCreation &&
      !isMachinOngoingUserCreationRoute
    ) {
      navigate(AppPath.SignIn);
    } else if (
      onboardingStatus === OnboardingStatus.OngoingWorkspaceCreation &&
      !isMatchingLocation(AppPath.CreateWorkspace)
    ) {
      navigate(AppPath.CreateWorkspace);
    } else if (
      onboardingStatus === OnboardingStatus.OngoingProfileCreation &&
      !isMatchingLocation(AppPath.CreateProfile)
    ) {
      navigate(AppPath.CreateProfile);
    } else if (
      onboardingStatus === OnboardingStatus.Completed &&
      isMatchingOnboardingRoute
    ) {
      navigate('/');
    }

    switch (true) {
      case isMatchingLocation(AppPath.CompaniesPage): {
        setHotkeyScope(TableHotkeyScope.Table, { goto: true });
        break;
      }
      case isMatchingLocation(AppPath.PeoplePage): {
        setHotkeyScope(TableHotkeyScope.Table, { goto: true });
        break;
      }
      case isMatchingLocation(AppPath.CompanyShowPage): {
        setHotkeyScope(PageHotkeyScope.CompanyShowPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppPath.PersonShowPage): {
        setHotkeyScope(PageHotkeyScope.PersonShowPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppPath.OpportunitiesPage): {
        setHotkeyScope(PageHotkeyScope.OpportunitiesPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppPath.SignIn): {
        setHotkeyScope(PageHotkeyScope.SignInUp);
        break;
      }
      case isMatchingLocation(AppPath.SignUp): {
        setHotkeyScope(PageHotkeyScope.SignInUp);
        break;
      }
      case isMatchingLocation(AppPath.Invite): {
        setHotkeyScope(PageHotkeyScope.SignInUp);
        break;
      }
      case isMatchingLocation(AppPath.CreateProfile): {
        setHotkeyScope(PageHotkeyScope.CreateProfile);
        break;
      }
      case isMatchingLocation(AppPath.CreateWorkspace): {
        setHotkeyScope(PageHotkeyScope.CreateWokspace);
        break;
      }
      case isMatchingLocation(SettingsPath.ProfilePage, AppBasePath.Settings): {
        setHotkeyScope(PageHotkeyScope.ProfilePage, { goto: true });
        break;
      }
      case isMatchingLocation(
        SettingsPath.WorkspaceMembersPage,
        AppBasePath.Settings,
      ): {
        setHotkeyScope(PageHotkeyScope.WorkspaceMemberPage, { goto: true });
        break;
      }
    }

    // eventTracker('pageview', {
    //   location: {
    //     pathname: location.pathname,
    //   },
    // });

    // setCurrentPageLocation(location.pathname);
  }, [
    onboardingStatus,
    navigate,
    isMatchingLocation,
    setHotkeyScope,
    location,
    // setCurrentPageLocation,
    // eventTracker,
  ]);

  return <></>;
}

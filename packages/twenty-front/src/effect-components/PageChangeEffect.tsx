import { useEffect, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useEventTracker } from '@/analytics/hooks/useEventTracker';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { isSignUpDisabledState } from '@/client-config/states/isSignUpDisabledState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandType } from '@/command-menu/types/Command';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { SettingsPath } from '@/types/SettingsPath';
import { IconCheckbox } from '@/ui/display/icon';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useGetWorkspaceFromInviteHashLazyQuery } from '~/generated/graphql';

import { useIsMatchingLocation } from '../hooks/useIsMatchingLocation';

// TODO: break down into smaller functions and / or hooks
export const PageChangeEffect = () => {
  const navigate = useNavigate();
  const isMatchingLocation = useIsMatchingLocation();
  const { enqueueSnackBar } = useSnackBar();

  const [previousLocation, setPreviousLocation] = useState('');

  const onboardingStatus = useOnboardingStatus();

  const setHotkeyScope = useSetHotkeyScope();

  const location = useLocation();

  const eventTracker = useEventTracker();

  const [workspaceFromInviteHashQuery] =
    useGetWorkspaceFromInviteHashLazyQuery();
  const { addToCommandMenu, setToIntitialCommandMenu } = useCommandMenu();

  const openCreateActivity = useOpenCreateActivityDrawer();

  const isSignUpDisabled = useRecoilValue(isSignUpDisabledState);

  useEffect(() => {
    if (!previousLocation || previousLocation !== location.pathname) {
      setPreviousLocation(location.pathname);
    } else {
      return;
    }
  }, [location, previousLocation]);

  useEffect(() => {
    const isMatchingOngoingUserCreationRoute =
      isMatchingLocation(AppPath.SignUp) ||
      isMatchingLocation(AppPath.SignIn) ||
      isMatchingLocation(AppPath.Invite) ||
      isMatchingLocation(AppPath.Verify);

    const isMatchingOnboardingRoute =
      isMatchingOngoingUserCreationRoute ||
      isMatchingLocation(AppPath.CreateWorkspace) ||
      isMatchingLocation(AppPath.CreateProfile) ||
      isMatchingLocation(AppPath.PlanRequired);

    const navigateToSignUp = () => {
      enqueueSnackBar('workspace does not exist', {
        variant: 'error',
      });
      navigate(AppPath.SignUp);
    };

    if (
      onboardingStatus === OnboardingStatus.OngoingUserCreation &&
      !isMatchingOngoingUserCreationRoute &&
      !isMatchingLocation(AppPath.ResetPassword)
    ) {
      navigate(AppPath.SignIn);
    } else if (
      onboardingStatus &&
      [OnboardingStatus.Canceled, OnboardingStatus.Incomplete].includes(
        onboardingStatus,
      ) &&
      !isMatchingLocation(AppPath.PlanRequired)
    ) {
      navigate(AppPath.PlanRequired);
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
    } else if (isMatchingLocation(AppPath.Invite)) {
      const inviteHash =
        matchPath({ path: '/invite/:workspaceInviteHash' }, location.pathname)
          ?.params.workspaceInviteHash || '';

      workspaceFromInviteHashQuery({
        variables: {
          inviteHash,
        },
        onCompleted: (data) => {
          if (!data.findWorkspaceFromInviteHash) {
            navigateToSignUp();
          }
        },
        onError: (_) => {
          navigateToSignUp();
        },
      });
    } else if (isMatchingLocation(AppPath.SignUp) && isSignUpDisabled) {
      navigate(AppPath.SignIn);
    }
  }, [
    enqueueSnackBar,
    isMatchingLocation,
    isSignUpDisabled,
    location.pathname,
    navigate,
    onboardingStatus,
    workspaceFromInviteHashQuery,
  ]);

  useEffect(() => {
    switch (true) {
      case isMatchingLocation(AppPath.RecordIndexPage): {
        setHotkeyScope(TableHotkeyScope.Table, {
          goto: true,
          keyboardShortcutMenu: true,
        });
        break;
      }
      case isMatchingLocation(AppPath.RecordShowPage): {
        setHotkeyScope(PageHotkeyScope.CompanyShowPage, {
          goto: true,
          keyboardShortcutMenu: true,
        });
        break;
      }
      case isMatchingLocation(AppPath.OpportunitiesPage): {
        setHotkeyScope(PageHotkeyScope.OpportunitiesPage, {
          goto: true,
          keyboardShortcutMenu: true,
        });
        break;
      }
      case isMatchingLocation(AppPath.TasksPage): {
        setHotkeyScope(PageHotkeyScope.TaskPage, {
          goto: true,
          keyboardShortcutMenu: true,
        });
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
      case isMatchingLocation(AppPath.PlanRequired): {
        setHotkeyScope(PageHotkeyScope.PlanRequired);
        break;
      }
      case isMatchingLocation(SettingsPath.ProfilePage, AppBasePath.Settings): {
        setHotkeyScope(PageHotkeyScope.ProfilePage, {
          goto: true,
          keyboardShortcutMenu: true,
        });
        break;
      }
      case isMatchingLocation(
        SettingsPath.WorkspaceMembersPage,
        AppBasePath.Settings,
      ): {
        setHotkeyScope(PageHotkeyScope.WorkspaceMemberPage, {
          goto: true,
          keyboardShortcutMenu: true,
        });
        break;
      }
    }
  }, [isMatchingLocation, setHotkeyScope]);

  useEffect(() => {
    setToIntitialCommandMenu();

    addToCommandMenu([
      {
        id: 'create-task',
        to: '',
        label: 'Create Task',
        type: CommandType.Create,
        Icon: IconCheckbox,
        onCommandClick: () => openCreateActivity({ type: 'Task' }),
      },
    ]);
  }, [addToCommandMenu, setToIntitialCommandMenu, openCreateActivity]);

  useEffect(() => {
    setTimeout(() => {
      eventTracker('pageview', {
        location: {
          pathname: location.pathname,
        },
      });
    }, 500);
  }, [eventTracker, location.pathname]);

  return <></>;
};

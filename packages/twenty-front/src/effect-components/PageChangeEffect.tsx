import { useEffect, useState } from 'react';
import { matchPath } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconCheckbox } from 'twenty-ui';

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
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useGetWorkspaceFromInviteHashLazyQuery } from '~/generated/graphql';
import {
  useIsMatchingLocation,
  useLocation,
  useNavigate,
} from '~/hooks/withoutRouter';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

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
  const { addToCommandMenu, setToInitialCommandMenu } = useCommandMenu();

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
      isMatchingLocation(AppPath.SignInUp) ||
      isMatchingLocation(AppPath.Invite) ||
      isMatchingLocation(AppPath.Verify);

    const isMatchingOnboardingRoute =
      isMatchingOngoingUserCreationRoute ||
      isMatchingLocation(AppPath.CreateWorkspace) ||
      isMatchingLocation(AppPath.CreateProfile) ||
      isMatchingLocation(AppPath.PlanRequired) ||
      isMatchingLocation(AppPath.PlanRequiredSuccess);

    const navigateToSignUp = () => {
      enqueueSnackBar('workspace does not exist', {
        variant: 'error',
      });
      navigate(AppPath.SignInUp);
    };

    if (
      onboardingStatus === OnboardingStatus.OngoingUserCreation &&
      !isMatchingOngoingUserCreationRoute &&
      !isMatchingLocation(AppPath.ResetPassword)
    ) {
      navigate(AppPath.SignInUp);
    } else if (
      isDefined(onboardingStatus) &&
      onboardingStatus === OnboardingStatus.Incomplete &&
      !isMatchingLocation(AppPath.PlanRequired)
    ) {
      navigate(AppPath.PlanRequired);
    } else if (
      isDefined(onboardingStatus) &&
      [OnboardingStatus.Unpaid, OnboardingStatus.Canceled].includes(
        onboardingStatus,
      ) &&
      !(
        isMatchingLocation(AppPath.SettingsCatchAll) ||
        isMatchingLocation(AppPath.PlanRequired)
      )
    ) {
      navigate(
        `${AppPath.SettingsCatchAll.replace('/*', '')}/${SettingsPath.Billing}`,
      );
    } else if (
      onboardingStatus === OnboardingStatus.OngoingWorkspaceActivation &&
      !isMatchingLocation(AppPath.CreateWorkspace) &&
      !isMatchingLocation(AppPath.PlanRequiredSuccess)
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
      navigate(AppPath.Index);
    } else if (
      onboardingStatus === OnboardingStatus.CompletedWithoutSubscription &&
      isMatchingOnboardingRoute &&
      !isMatchingLocation(AppPath.PlanRequired)
    ) {
      navigate(AppPath.Index);
    } else if (isMatchingLocation(AppPath.Invite)) {
      const inviteHash =
        matchPath({ path: '/invite/:workspaceInviteHash' }, location.pathname)
          ?.params.workspaceInviteHash || '';

      workspaceFromInviteHashQuery({
        variables: {
          inviteHash,
        },
        onCompleted: (data) => {
          if (isUndefinedOrNull(data.findWorkspaceFromInviteHash)) {
            navigateToSignUp();
          }
        },
        onError: (_) => {
          navigateToSignUp();
        },
      });
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

      case isMatchingLocation(AppPath.SignInUp): {
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
    setToInitialCommandMenu();

    addToCommandMenu([
      {
        id: 'create-task',
        to: '',
        label: 'Create Task',
        type: CommandType.Create,
        Icon: IconCheckbox,
        onCommandClick: () =>
          openCreateActivity({ type: 'Task', targetableObjects: [] }),
      },
    ]);
  }, [addToCommandMenu, setToInitialCommandMenu, openCreateActivity]);

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

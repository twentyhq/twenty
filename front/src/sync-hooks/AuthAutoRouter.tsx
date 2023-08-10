import { useEffect, useState } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { IconCheckbox, IconNotes } from '@tabler/icons-react';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useEventTracker } from '@/analytics/hooks/useEventTracker';
import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandType } from '@/command-menu/types/Command';
import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/snack-bar/hooks/useSnackBar';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useGetWorkspaceFromInviteHashLazyQuery } from '~/generated/graphql';
import { ActivityType, CommentableType } from '~/generated/graphql';

import { useIsMatchingLocation } from '../hooks/useIsMatchingLocation';

export function AuthAutoRouter() {
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

  useEffect(() => {
    if (!previousLocation || previousLocation !== location.pathname) {
      setPreviousLocation(location.pathname);
    } else {
      return;
    }

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

    function navigateToSignUp() {
      enqueueSnackBar('workspace does not exist', {
        variant: 'error',
      });
      navigate(AppPath.SignUp);
    }

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
      case isMatchingLocation(AppPath.TasksPage): {
        setHotkeyScope(PageHotkeyScope.TaskPage, { goto: true });
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

    setToIntitialCommandMenu();
    switch (true) {
      case isMatchingLocation(AppPath.CompanyShowPage): {
        const companyId = matchPath(
          { path: '/companies/:id' },
          location.pathname,
        )?.params.id;

        const entity = !!companyId
          ? { id: companyId, type: CommentableType.Company }
          : undefined;

        addToCommandMenu([
          {
            to: '',
            label: 'Create Task',
            type: CommandType.Create,
            icon: <IconCheckbox />,
            onCommandClick: () => openCreateActivity(ActivityType.Task, entity),
          },
          {
            to: '',
            label: 'Create Note',
            type: CommandType.Create,
            icon: <IconNotes />,
            onCommandClick: () => openCreateActivity(ActivityType.Note, entity),
          },
        ]);
        break;
      }
      case isMatchingLocation(AppPath.PersonShowPage): {
        const personId = matchPath({ path: '/person/:id' }, location.pathname)
          ?.params.id;

        const entity = !!personId
          ? { id: personId, type: CommentableType.Person }
          : undefined;

        addToCommandMenu([
          {
            to: '',
            label: 'Create Task',
            type: CommandType.Create,
            icon: <IconCheckbox />,
            onCommandClick: () => openCreateActivity(ActivityType.Task, entity),
          },
          {
            to: '',
            label: 'Create Note',
            type: CommandType.Create,
            icon: <IconNotes />,
            onCommandClick: () => openCreateActivity(ActivityType.Note, entity),
          },
        ]);
        break;
      }
      default:
        addToCommandMenu([
          {
            to: '',
            label: 'Create Task',
            type: CommandType.Create,
            icon: <IconCheckbox />,
            onCommandClick: () => openCreateActivity(ActivityType.Task),
          },
        ]);
        break;
    }

    setTimeout(() => {
      eventTracker('pageview', {
        location: {
          pathname: location.pathname,
        },
      });
    }, 500);
  }, [
    onboardingStatus,
    navigate,
    isMatchingLocation,
    setHotkeyScope,
    location,
    previousLocation,
    eventTracker,
    workspaceFromInviteHashQuery,
    enqueueSnackBar,
    addToCommandMenu,
    openCreateActivity,
    setToIntitialCommandMenu,
  ]);

  return <></>;
}

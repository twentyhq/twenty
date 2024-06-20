import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconCheckbox } from 'twenty-ui';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useEventTracker } from '@/analytics/hooks/useEventTracker';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandType } from '@/command-menu/types/Command';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { SettingsPath } from '@/types/SettingsPath';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';
import { isDefined } from '~/utils/isDefined';

// TODO: break down into smaller functions and / or hooks
//  - moved usePageChangeEffectNavigateLocation into dedicated hook
export const PageChangeEffect = () => {
  const navigate = useNavigate();
  const isMatchingLocation = useIsMatchingLocation();

  const [previousLocation, setPreviousLocation] = useState('');

  const setHotkeyScope = useSetHotkeyScope();

  const location = useLocation();

  const pageChangeEffectNavigateLocation =
    usePageChangeEffectNavigateLocation();

  const eventTracker = useEventTracker();

  const { addToCommandMenu, setToInitialCommandMenu } = useCommandMenu();

  const openCreateActivity = useOpenCreateActivityDrawer();

  useEffect(() => {
    if (!previousLocation || previousLocation !== location.pathname) {
      setPreviousLocation(location.pathname);
    } else {
      return;
    }
  }, [location, previousLocation]);

  useEffect(() => {
    if (isDefined(pageChangeEffectNavigateLocation)) {
      navigate(pageChangeEffectNavigateLocation);
    }
  }, [navigate, pageChangeEffectNavigateLocation]);

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
      case isMatchingLocation(AppPath.SyncEmails): {
        setHotkeyScope(PageHotkeyScope.SyncEmail);
        break;
      }
      case isMatchingLocation(AppPath.InviteTeam): {
        setHotkeyScope(PageHotkeyScope.InviteTeam);
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

  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();
  const isCaptchaScriptLoaded = useRecoilValue(isCaptchaScriptLoadedState);

  useEffect(() => {
    if (
      isCaptchaScriptLoaded &&
      isMatchingLocation(AppPath.SignInUp || AppPath.Invite)
    ) {
      requestFreshCaptchaToken();
    }
  }, [isCaptchaScriptLoaded, isMatchingLocation, requestFreshCaptchaToken]);

  return <></>;
};

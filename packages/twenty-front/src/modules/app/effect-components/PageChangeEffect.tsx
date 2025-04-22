import { useEffect, useState } from 'react';
import {
  matchPath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import {
  setSessionId,
  useEventTracker,
} from '@/analytics/hooks/useEventTracker';
import { useExecuteTasksOnAnyLocationChange } from '@/app/hooks/useExecuteTasksOnAnyLocationChange';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { isCaptchaRequiredForPath } from '@/captcha/utils/isCaptchaRequiredForPath';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { SettingsPath } from '@/types/SettingsPath';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { isDefined } from 'twenty-shared/utils';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';
import { useInitializeQueryParamState } from '~/modules/app/hooks/useInitializeQueryParamState';
import { AnalyticsType } from '~/generated/graphql';
import { getPageTitleFromPath } from '~/utils/title-utils';

// TODO: break down into smaller functions and / or hooks
//  - moved usePageChangeEffectNavigateLocation into dedicated hook
export const PageChangeEffect = () => {
  const navigate = useNavigate();
  const { isMatchingLocation } = useIsMatchingLocation();

  const [previousLocation, setPreviousLocation] = useState('');

  const setHotkeyScope = useSetHotkeyScope();

  const location = useLocation();

  const pageChangeEffectNavigateLocation =
    usePageChangeEffectNavigateLocation();

  const eventTracker = useEventTracker();

  const { initializeQueryParamState } = useInitializeQueryParamState();

  //TODO: refactor useResetTableRowSelection hook to not throw when the argument `recordTableId` is an empty string
  // - replace CoreObjectNamePlural.Person
  const objectNamePlural =
    useParams().objectNamePlural ?? CoreObjectNamePlural.Person;

  const resetTableSelections = useResetTableRowSelection(objectNamePlural);

  const { executeTasksOnAnyLocationChange } =
    useExecuteTasksOnAnyLocationChange();

  useEffect(() => {
    if (!previousLocation || previousLocation !== location.pathname) {
      setPreviousLocation(location.pathname);
      executeTasksOnAnyLocationChange();
    } else {
      return;
    }
  }, [location, previousLocation, executeTasksOnAnyLocationChange]);

  useEffect(() => {
    initializeQueryParamState();

    if (isDefined(pageChangeEffectNavigateLocation)) {
      navigate(pageChangeEffectNavigateLocation);
    }
  }, [navigate, pageChangeEffectNavigateLocation, initializeQueryParamState]);

  useEffect(() => {
    const isLeavingRecordIndexPage = !!matchPath(
      AppPath.RecordIndexPage,
      previousLocation,
    );

    if (isLeavingRecordIndexPage) {
      resetTableSelections();
    }
  }, [isMatchingLocation, previousLocation, resetTableSelections]);

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
        setHotkeyScope(PageHotkeyScope.CreateWorkspace);
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
      case isMatchingLocation(SettingsPath.Domain, AppBasePath.Settings): {
        setHotkeyScope(PageHotkeyScope.Settings, {
          goto: false,
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
    setTimeout(() => {
      setSessionId();
      eventTracker(AnalyticsType['PAGEVIEW'], {
        name: getPageTitleFromPath(location.pathname),
        properties: {
          pathname: location.pathname,
          locale: navigator.language,
          userAgent: window.navigator.userAgent,
          href: window.location.href,
          referrer: document.referrer,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
    }, 500);
  }, [eventTracker, location.pathname]);

  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();
  const isCaptchaScriptLoaded = useRecoilValue(isCaptchaScriptLoadedState);

  useEffect(() => {
    if (isCaptchaScriptLoaded && isCaptchaRequiredForPath(location.pathname)) {
      requestFreshCaptchaToken();
    }
  }, [isCaptchaScriptLoaded, location.pathname, requestFreshCaptchaToken]);

  return <></>;
};

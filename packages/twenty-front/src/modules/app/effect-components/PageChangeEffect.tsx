import { useEffect, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconCheckbox } from 'twenty-ui';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import {
  setSessionId,
  useEventTracker,
} from '@/analytics/hooks/useEventTracker';
import { useRequestFreshCaptchaToken } from '@/captcha/hooks/useRequestFreshCaptchaToken';
import { isCaptchaScriptLoadedState } from '@/captcha/states/isCaptchaScriptLoadedState';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandType } from '@/command-menu/types/Command';
import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreCurrentViewIdState } from '@/context-store/states/contextStoreCurrentViewIdState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useNonSystemActiveObjectMetadataItems } from '@/object-metadata/hooks/useNonSystemActiveObjectMetadataItems';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { SettingsPath } from '@/types/SettingsPath';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useCleanRecoilState } from '~/hooks/useCleanRecoilState';
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

  const { cleanRecoilState } = useCleanRecoilState();

  const eventTracker = useEventTracker();

  const { addToCommandMenu, setObjectsInCommandMenu } = useCommandMenu();

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Task,
  });

  const [searchParams] = useSearchParams();
  const { objectNameSingular, objectNamePlural } = useParams();

  const objectMetadataItem = useRecoilValue(
    objectMetadataItemFamilySelector(
      objectNameSingular
        ? { objectName: objectNameSingular, objectNameType: 'singular' }
        : objectNamePlural
          ? { objectName: objectNamePlural, objectNameType: 'plural' }
          : { objectName: '', objectNameType: 'singular' },
    ),
  );

  const setContextStoreCurrentViewId = useSetRecoilState(
    contextStoreCurrentViewIdState,
  );
  const setContextStoreCurrentObjectMetadataId = useSetRecoilState(
    contextStoreCurrentObjectMetadataIdState,
  );
  const setContextStoreTargetedRecordIds = useSetRecoilState(
    contextStoreTargetedRecordIdsState,
  );

  useEffect(() => {
    cleanRecoilState();
  }, [cleanRecoilState]);

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
    const viewId = searchParams.get('view');
    setContextStoreCurrentViewId(viewId);
    setContextStoreTargetedRecordIds([]);
  }, [
    searchParams,
    setContextStoreCurrentViewId,
    setContextStoreTargetedRecordIds,
  ]);

  useEffect(() => {
    setContextStoreCurrentObjectMetadataId(objectMetadataItem?.id ?? null);
  }, [objectMetadataItem, setContextStoreCurrentObjectMetadataId]);

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

  const { nonSystemActiveObjectMetadataItems } =
    useNonSystemActiveObjectMetadataItems();

  useEffect(() => {
    setObjectsInCommandMenu(nonSystemActiveObjectMetadataItems);

    addToCommandMenu([
      {
        id: 'create-task',
        to: '',
        label: 'Create Task',
        type: CommandType.Create,
        Icon: IconCheckbox,
        onCommandClick: () =>
          openCreateActivity({
            targetableObjects: [],
          }),
      },
    ]);
  }, [
    nonSystemActiveObjectMetadataItems,
    addToCommandMenu,
    setObjectsInCommandMenu,
    openCreateActivity,
    objectMetadataItems,
  ]);

  useEffect(() => {
    setTimeout(() => {
      setSessionId();
      eventTracker('pageview', {
        pathname: location.pathname,
        locale: navigator.language,
        userAgent: window.navigator.userAgent,
        href: window.location.href,
        referrer: document.referrer,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }, 500);
  }, [eventTracker, location.pathname]);

  const { requestFreshCaptchaToken } = useRequestFreshCaptchaToken();
  const isCaptchaScriptLoaded = useRecoilValue(isCaptchaScriptLoadedState);

  useEffect(() => {
    if (
      isCaptchaScriptLoaded &&
      (isMatchingLocation(AppPath.SignInUp) ||
        isMatchingLocation(AppPath.Invite) ||
        isMatchingLocation(AppPath.ResetPassword))
    ) {
      requestFreshCaptchaToken();
    }
  }, [isCaptchaScriptLoaded, isMatchingLocation, requestFreshCaptchaToken]);

  return <></>;
};

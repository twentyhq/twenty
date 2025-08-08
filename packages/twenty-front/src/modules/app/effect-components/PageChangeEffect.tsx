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
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { useResetFocusStackToRecordIndex } from '@/object-record/record-index/hooks/useResetFocusStackToRecordIndex';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { PageFocusId } from '@/types/PageFocusId';
import { useResetFocusStackToFocusItem } from '@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { AnalyticsType } from '~/generated/graphql';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';
import { useInitializeQueryParamState } from '~/modules/app/hooks/useInitializeQueryParamState';
import { isMatchingLocation } from '~/utils/isMatchingLocation';
import { getPageTitleFromPath } from '~/utils/title-utils';

// TODO: break down into smaller functions and / or hooks
//  - moved usePageChangeEffectNavigateLocation into dedicated hook
export const PageChangeEffect = () => {
  const navigate = useNavigate();

  const [previousLocation, setPreviousLocation] = useState('');

  const location = useLocation();

  const pageChangeEffectNavigateLocation =
    usePageChangeEffectNavigateLocation();

  const eventTracker = useEventTracker();

  const { initializeQueryParamState } = useInitializeQueryParamState();

  //TODO: refactor useResetTableRowSelection hook to not throw when the argument `recordTableId` is an empty string
  // - replace CoreObjectNamePlural.Person
  const objectNamePlural =
    useParams().objectNamePlural ?? CoreObjectNamePlural.Person;

  const contextStoreCurrentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const contextStoreCurrentViewType = useRecoilComponentValue(
    contextStoreCurrentViewTypeComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectNamePlural,
    contextStoreCurrentViewId || '',
  );

  const resetTableSelections = useResetTableRowSelection(recordIndexId);
  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordIndexId);
  const { deactivateRecordTableRow } = useActiveRecordTableRow(recordIndexId);

  const { resetRecordSelection } = useRecordBoardSelection(recordIndexId);
  const { deactivateBoardCard } = useActiveRecordBoardCard(recordIndexId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordIndexId);

  const { executeTasksOnAnyLocationChange } =
    useExecuteTasksOnAnyLocationChange();

  const { closeCommandMenu } = useCommandMenu();

  const { resetFocusStackToFocusItem } = useResetFocusStackToFocusItem();

  const { resetFocusStackToRecordIndex } = useResetFocusStackToRecordIndex();

  useEffect(() => {
    closeCommandMenu();
  }, [location.pathname, closeCommandMenu]);

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
      if (contextStoreCurrentViewType === ContextStoreViewType.Table) {
        resetTableSelections();
        unfocusRecordTableRow();
        deactivateRecordTableRow();
      }
      if (contextStoreCurrentViewType === ContextStoreViewType.Kanban) {
        resetRecordSelection();
        deactivateBoardCard();
        unfocusBoardCard();
      }
    }

    switch (true) {
      case isMatchingLocation(location, AppPath.RecordIndexPage): {
        resetFocusStackToRecordIndex();
        break;
      }
      case isMatchingLocation(location, AppPath.RecordShowPage): {
        resetFocusStackToFocusItem({
          focusStackItem: {
            focusId: PageFocusId.RecordShowPage,
            componentInstance: {
              componentType: FocusComponentType.PAGE,
              componentInstanceId: PageFocusId.RecordShowPage,
            },
            globalHotkeysConfig: {
              enableGlobalHotkeysWithModifiers: true,
              enableGlobalHotkeysConflictingWithKeyboard: true,
            },
          },
        });
        break;
      }
      case isMatchingLocation(location, AppPath.SignInUp): {
        resetFocusStackToFocusItem({
          focusStackItem: {
            focusId: PageFocusId.SignInUp,
            componentInstance: {
              componentType: FocusComponentType.PAGE,
              componentInstanceId: PageFocusId.SignInUp,
            },
            globalHotkeysConfig: {
              enableGlobalHotkeysWithModifiers: false,
              enableGlobalHotkeysConflictingWithKeyboard: false,
            },
          },
        });
        break;
      }
      case isMatchingLocation(location, AppPath.Invite): {
        resetFocusStackToFocusItem({
          focusStackItem: {
            focusId: PageFocusId.InviteTeam,
            componentInstance: {
              componentType: FocusComponentType.PAGE,
              componentInstanceId: PageFocusId.InviteTeam,
            },
            globalHotkeysConfig: {
              enableGlobalHotkeysWithModifiers: false,
              enableGlobalHotkeysConflictingWithKeyboard: false,
            },
          },
        });
        break;
      }
      case isMatchingLocation(location, AppPath.CreateProfile): {
        resetFocusStackToFocusItem({
          focusStackItem: {
            focusId: PageFocusId.CreateProfile,
            componentInstance: {
              componentType: FocusComponentType.PAGE,
              componentInstanceId: PageFocusId.CreateProfile,
            },
            globalHotkeysConfig: {
              enableGlobalHotkeysWithModifiers: false,
              enableGlobalHotkeysConflictingWithKeyboard: false,
            },
          },
        });
        break;
      }
      case isMatchingLocation(location, AppPath.CreateWorkspace): {
        resetFocusStackToFocusItem({
          focusStackItem: {
            focusId: PageFocusId.CreateWorkspace,
            componentInstance: {
              componentType: FocusComponentType.PAGE,
              componentInstanceId: PageFocusId.CreateWorkspace,
            },
            globalHotkeysConfig: {
              enableGlobalHotkeysWithModifiers: false,
              enableGlobalHotkeysConflictingWithKeyboard: false,
            },
          },
        });
        break;
      }
      case isMatchingLocation(location, AppPath.SyncEmails): {
        resetFocusStackToFocusItem({
          focusStackItem: {
            focusId: PageFocusId.SyncEmail,
            componentInstance: {
              componentType: FocusComponentType.PAGE,
              componentInstanceId: PageFocusId.SyncEmail,
            },
            globalHotkeysConfig: {
              enableGlobalHotkeysWithModifiers: false,
              enableGlobalHotkeysConflictingWithKeyboard: false,
            },
          },
        });
        break;
      }
      case isMatchingLocation(location, AppPath.InviteTeam): {
        resetFocusStackToFocusItem({
          focusStackItem: {
            focusId: PageFocusId.InviteTeam,
            componentInstance: {
              componentType: FocusComponentType.PAGE,
              componentInstanceId: PageFocusId.InviteTeam,
            },
            globalHotkeysConfig: {
              enableGlobalHotkeysWithModifiers: false,
              enableGlobalHotkeysConflictingWithKeyboard: false,
            },
          },
        });
        break;
      }
      case isMatchingLocation(location, AppPath.PlanRequired): {
        resetFocusStackToFocusItem({
          focusStackItem: {
            focusId: PageFocusId.PlanRequired,
            componentInstance: {
              componentType: FocusComponentType.PAGE,
              componentInstanceId: PageFocusId.PlanRequired,
            },
            globalHotkeysConfig: {
              enableGlobalHotkeysWithModifiers: false,
              enableGlobalHotkeysConflictingWithKeyboard: false,
            },
          },
        });
        break;
      }
      case location.pathname.startsWith(AppBasePath.Settings): {
        resetFocusStackToFocusItem({
          focusStackItem: {
            focusId: PageFocusId.Settings,
            componentInstance: {
              componentType: FocusComponentType.PAGE,
              componentInstanceId: PageFocusId.Settings,
            },
            globalHotkeysConfig: {
              enableGlobalHotkeysWithModifiers: false,
              enableGlobalHotkeysConflictingWithKeyboard: false,
            },
          },
        });
        break;
      }
    }
  }, [
    location,
    previousLocation,
    contextStoreCurrentViewType,
    resetTableSelections,
    unfocusRecordTableRow,
    deactivateRecordTableRow,
    resetRecordSelection,
    deactivateBoardCard,
    unfocusBoardCard,
    resetFocusStackToRecordIndex,
    resetFocusStackToFocusItem,
  ]);

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

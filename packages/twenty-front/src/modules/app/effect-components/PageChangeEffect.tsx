import { useExecuteTasksOnAnyLocationChange } from '@/app/hooks/useExecuteTasksOnAnyLocationChange';
import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useReturnToPath } from '@/auth/hooks/useReturnToPath';
import { useIsOnAuthOrOnboardingPage } from '@/auth/hooks/useIsOnAuthOrOnboardingPage';
import { searchSidePanelHandoffPathnameState } from '@/search/states/searchSidePanelHandoffPathnameState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useResetRecordBoardSelection } from '@/object-record/record-board/hooks/useResetRecordBoardSelection';
import { useResetFocusStackToRecordIndex } from '@/object-record/record-index/hooks/useResetFocusStackToRecordIndex';
import { useResetTableRowSelection } from '@/object-record/record-table/hooks/internal/useResetTableRowSelection';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useOpenNewRecordTitleCell } from '@/object-record/record-title-cell/hooks/useOpenNewRecordTitleCell';
import { newRecordTitleCellToOpenState } from '@/object-record/record-title-cell/states/newRecordTitleCellToOpenState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { PageFocusId } from '@/types/PageFocusId';
import { useResetFocusStackToFocusItem } from '@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { useStore } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import {
  matchPath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { AppBasePath, AppPath, SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { usePageChangeEffectNavigateLocation } from '~/hooks/usePageChangeEffectNavigateLocation';
import { getPageLayoutIdForLocation } from '~/modules/app/utils/getPageLayoutIdForLocation';
import { isAiChatPath } from '~/utils/isAiChatPath';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

// TODO: break down into smaller functions and / or hooks
//  - moved usePageChangeEffectNavigateLocation into dedicated hook
export const PageChangeEffect = () => {
  const store = useStore();
  const navigate = useNavigate();

  const [previousLocation, setPreviousLocation] = useState('');

  const location = useLocation();

  const pageChangeEffectNavigateLocation =
    usePageChangeEffectNavigateLocation();

  //TODO: refactor useResetTableRowSelection hook to not throw when the argument `recordTableId` is an empty string
  // - replace CoreObjectNamePlural.Person
  const objectNamePlural =
    useParams().objectNamePlural ?? CoreObjectNamePlural.Person;

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const contextStoreCurrentViewType = useAtomComponentStateValue(
    contextStoreCurrentViewTypeComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectNamePlural,
    contextStoreCurrentViewId || '',
  );

  const { resetTableRowSelection } = useResetTableRowSelection(recordIndexId);
  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordIndexId);
  const { deactivateRecordTableRow } = useActiveRecordTableRow(recordIndexId);

  const { resetRecordBoardSelection } =
    useResetRecordBoardSelection(recordIndexId);
  const { deactivateBoardCard } = useActiveRecordBoardCard(recordIndexId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordIndexId);

  const { executeTasksOnAnyLocationChange } =
    useExecuteTasksOnAnyLocationChange();

  const isAppEffectRedirectEnabled = useAtomStateValue(
    isAppEffectRedirectEnabledState,
  );

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { saveReturnToPath, getReturnToPath, clearReturnToPath } =
    useReturnToPath();

  const isOnAuthOrOnboardingPage = useIsOnAuthOrOnboardingPage();

  const closeSidePanelUnlessNotRelevant = useCallback(
    (pathname: string) => {
      // Collapsing the search page reopens search in the panel of the route it
      // lands on, from a layout effect that runs before this one. That panel
      // belongs to the destination, so closing it here would undo the handoff.
      const searchHandoffPathname = store.get(
        searchSidePanelHandoffPathnameState.atom,
      );

      if (isDefined(searchHandoffPathname)) {
        if (searchHandoffPathname === pathname) {
          return;
        }

        store.set(searchSidePanelHandoffPathnameState.atom, null);
      }

      const currentPage = store.get(sidePanelPageState.atom);

      if (currentPage === SidePanelPages.NavigationMenuItemEdit) {
        return;
      }

      const sidePanelIsAiChat = currentPage === SidePanelPages.AskAI;

      if (sidePanelIsAiChat) {
        return;
      }

      closeSidePanelMenu();
    },
    [closeSidePanelMenu, store],
  );

  const { resetFocusStackToFocusItem } = useResetFocusStackToFocusItem();

  const { resetFocusStackToRecordIndex } = useResetFocusStackToRecordIndex();

  const { openNewRecordTitleCell } = useOpenNewRecordTitleCell();

  useEffect(() => {
    closeSidePanelUnlessNotRelevant(location.pathname);
  }, [location.pathname, closeSidePanelUnlessNotRelevant]);

  useEffect(() => {
    if (!previousLocation || previousLocation !== location.pathname) {
      setPreviousLocation(location.pathname);
      executeTasksOnAnyLocationChange();

      const newPageLayoutId = getPageLayoutIdForLocation({
        location,
        store,
      });

      store.set(currentPageLayoutIdState.atom, newPageLayoutId);
    }
  }, [location, previousLocation, executeTasksOnAnyLocationChange, store]);

  useEffect(() => {
    if (
      isDefined(pageChangeEffectNavigateLocation) &&
      isAppEffectRedirectEnabled
    ) {
      if (
        pageChangeEffectNavigateLocation === AppPath.SignInUp &&
        !isOnAuthOrOnboardingPage
      ) {
        saveReturnToPath(
          `${window.location.pathname}${window.location.search}${window.location.hash}`,
        );
      }

      const consumedReturnToPath =
        getReturnToPath() === pageChangeEffectNavigateLocation;

      navigate(pageChangeEffectNavigateLocation);

      if (consumedReturnToPath) {
        clearReturnToPath();
      }

      if (
        store.get(shouldOpenAiChatAfterOnboardingState.atom) &&
        !isAiChatPath(pageChangeEffectNavigateLocation)
      ) {
        store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
      }
    }
  }, [
    navigate,
    pageChangeEffectNavigateLocation,
    isAppEffectRedirectEnabled,
    isOnAuthOrOnboardingPage,
    saveReturnToPath,
    getReturnToPath,
    clearReturnToPath,
    store,
  ]);

  useEffect(() => {
    const isLeavingRecordIndexPage = !!matchPath(
      AppPath.RecordIndexPage,
      previousLocation,
    );

    if (isLeavingRecordIndexPage) {
      if (contextStoreCurrentViewType === ContextStoreViewType.Table) {
        resetTableRowSelection();
        unfocusRecordTableRow();
        deactivateRecordTableRow();
      }
      if (contextStoreCurrentViewType === ContextStoreViewType.Kanban) {
        resetRecordBoardSelection();
        deactivateBoardCard();
        unfocusBoardCard();
      }
    }

    if (location.pathname === previousLocation) {
      return;
    }

    switch (true) {
      case isMatchingLocation(location, AppPath.RecordIndexPage): {
        resetFocusStackToRecordIndex();
        break;
      }
      case isMatchingLocation(location, AppPath.RecordShowPage): {
        const isSidePanelOpen = store.get(isSidePanelOpenedState.atom);

        if (!isSidePanelOpen) {
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
        }

        const newRecordTitleCellToOpen = store.get(
          newRecordTitleCellToOpenState.atom,
        );

        if (isDefined(newRecordTitleCellToOpen)) {
          const objectRecordIdFromPath = matchPath(
            AppPath.RecordShowPage,
            location.pathname,
          )?.params.objectRecordId;

          if (newRecordTitleCellToOpen.recordId === objectRecordIdFromPath) {
            openNewRecordTitleCell(newRecordTitleCellToOpen);
          }

          store.set(newRecordTitleCellToOpenState.atom, null);
        }
        break;
      }
      case isMatchingLocation(location, AppPath.PageLayoutPage): {
        resetFocusStackToFocusItem({
          focusStackItem: {
            focusId: PageFocusId.PageLayoutPage,
            componentInstance: {
              componentType: FocusComponentType.PAGE,
              componentInstanceId: PageFocusId.PageLayoutPage,
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
      case isMatchingLocation(location, AppPath.WorkspaceActivation): {
        resetFocusStackToFocusItem({
          focusStackItem: {
            focusId: PageFocusId.WorkspaceActivation,
            componentInstance: {
              componentType: FocusComponentType.PAGE,
              componentInstanceId: PageFocusId.WorkspaceActivation,
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
    resetTableRowSelection,
    unfocusRecordTableRow,
    deactivateRecordTableRow,
    resetRecordBoardSelection,
    deactivateBoardCard,
    unfocusBoardCard,
    resetFocusStackToRecordIndex,
    resetFocusStackToFocusItem,
    openNewRecordTitleCell,
    store,
  ]);

  return <></>;
};

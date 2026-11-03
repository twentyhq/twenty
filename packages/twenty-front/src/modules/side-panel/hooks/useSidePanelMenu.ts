import { AppNavigatorContext } from '@/app/contexts/AppNavigatorContext';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { coreAgentMainEditScopeState } from '@/object-core/agents/states/coreAgentMainEditScopeState';
import { CoreAgentCommandOriginContext } from '@/object-core/commands/contexts/CoreAgentCommandOriginContext';
import { captureCoreAgentCommandOrigin } from '@/object-core/commands/utils/captureCoreAgentCommandOrigin';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { type CoreAgentCommandOrigin } from '@/object-core/commands/types/CoreAgentCommandOrigin';
import { getCoreAgentCommandTargetFromPath } from '@/object-core/commands/utils/getCoreAgentCommandTargetFromPath';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useResetRecordIndexSelection } from '@/object-record/record-index/hooks/useResetRecordIndexSelection';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { emitSidePanelOpenEvent } from '@/ui/layout/side-panel/utils/emitSidePanelOpenEvent';
import { waitForSidePanelClose } from '@/ui/layout/side-panel/utils/waitForSidePanelClose';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconDotsVertical } from 'twenty-ui/icon';

export const useSidePanelMenu = () => {
  const store = useStore();
  const callerOrigin = useContext(CoreAgentCommandOriginContext);
  const { closeDialog } = useDialog();
  const navigator = useContext(AppNavigatorContext);
  const { pathname } = useLocation();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();
  const { resetRecordIndexSelection } = useResetRecordIndexSelection(
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeSidePanelMenu = useCallback(async () => {
    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);

    if (!isSidePanelOpened) {
      return;
    }

    const isLayoutCustomizationModeEnabled = store.get(
      isLayoutCustomizationModeEnabledState.atom,
    );

    if (isLayoutCustomizationModeEnabled) {
      resetRecordIndexSelection();
    }

    store.set(isSidePanelOpenedState.atom, false);
    store.set(isSidePanelClosingState.atom, true);
    closeAnyOpenDropdown();
    removeFocusItemFromFocusStackById({
      focusId: SIDE_PANEL_FOCUS_ID,
    });

    await waitForSidePanelClose();
  }, [
    closeAnyOpenDropdown,
    removeFocusItemFromFocusStackById,
    store,
    resetRecordIndexSelection,
  ]);

  const openSidePanelMenu = useCallback(() => {
    emitSidePanelOpenEvent();
    closeAnyOpenDropdown();
    store.set(sidePanelSearchState.atom, '');
    store.set(sidePanelSearchObjectFilterState.atom, null);

    const workspace = store.get(currentWorkspaceState.atom);
    const user = store.get(currentUserState.atom);
    const fallbackTarget = getCoreAgentCommandTargetFromPath(pathname);
    const mainScope = store.get(coreAgentMainEditScopeState.atom);
    const hasMatchingMainScope =
      fallbackTarget?.type === 'record' &&
      mainScope?.agentId === fallbackTarget.agentId &&
      mainScope.workspaceId === workspace?.id &&
      mainScope.userId === user?.id;
    const origin: CoreAgentCommandOrigin | null =
      callerOrigin ??
      (isDefined(fallbackTarget)
        ? {
            target: fallbackTarget,
            navigator,
            scopeId: hasMatchingMainScope ? mainScope.scopeId : null,
            surfaceType: 'main',
            workspaceId: workspace?.id,
            userId: user?.id,
          }
        : null);
    const pageId = v4();
    const capturedOrigin = isDefined(origin)
      ? captureCoreAgentCommandOrigin({ store, pageId, origin, closeDialog })
      : null;
    navigateSidePanel({
      pageId,
      routedFlowStateScopeId: capturedOrigin?.scopeId,
      page: SidePanelPages.CommandMenuDisplay,
      pageTitle: t`Command Menu`,
      pageIcon: IconDotsVertical,
      resetNavigationStack: origin?.surfaceType !== 'side-panel',
    });
  }, [
    callerOrigin,
    closeDialog,
    navigator,
    pathname,
    closeAnyOpenDropdown,
    navigateSidePanel,
    store,
  ]);

  const navigateSidePanelMenu = navigateSidePanel;

  const toggleSidePanelMenu = useCallback(() => {
    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);

    store.set(sidePanelSearchState.atom, '');
    store.set(sidePanelSearchObjectFilterState.atom, null);

    if (isSidePanelOpened) {
      closeSidePanelMenu();
    } else {
      openSidePanelMenu();
    }
  }, [closeSidePanelMenu, openSidePanelMenu, store]);

  return {
    openSidePanelMenu,
    closeSidePanelMenu,
    navigateSidePanelMenu,
    toggleSidePanelMenu,
  };
};

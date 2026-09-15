import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelCloseAnimationCompleteCleanup } from '@/side-panel/hooks/useSidePanelCloseAnimationCompleteCleanup';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { isInboxSplitViewOpenState } from '@/inbox/states/isInboxSplitViewOpenState';
import { collapseNavigationDrawerForInboxPanel } from '@/inbox/utils/collapseNavigationDrawerForInboxPanel';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import {
  type SidePanelNavigationStackItem,
  type SidePanelNavigationTarget,
  sidePanelNavigationStackState,
} from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelShouldFocusTitleInputComponentState } from '@/side-panel/states/sidePanelShouldFocusTitleInputComponentState';
import { releaseRemovedRoutedFlowStateScopes } from '@/side-panel/routing/utils/releaseRemovedRoutedFlowStateScopes';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { v4 } from 'uuid';

export const useNavigateSidePanel = () => {
  const store = useStore();
  const { sidePanelCloseAnimationCompleteCleanup } =
    useSidePanelCloseAnimationCompleteCleanup();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openSidePanel = useCallback(() => {
    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);

    const isSidePanelClosing = store.get(isSidePanelClosingState.atom);

    if (isSidePanelClosing) {
      sidePanelCloseAnimationCompleteCleanup({
        emitSidePanelCloseEvent: false,
      });
    }

    pushFocusItemToFocusStack({
      focusId: SIDE_PANEL_FOCUS_ID,
      component: {
        type: FocusComponentType.SIDE_PANEL,
        instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    if (isSidePanelOpened) {
      return;
    }

    store.set(isSidePanelOpenedState.atom, true);
    store.set(hasUserSelectedSidePanelListItemState.atom, false);

    if (store.get(isInboxSplitViewOpenState.atom)) {
      collapseNavigationDrawerForInboxPanel(store);
    }
  }, [
    sidePanelCloseAnimationCompleteCleanup,
    pushFocusItemToFocusStack,
    store,
  ]);

  const navigateSidePanel = useCallback(
    (
      navigationTarget: SidePanelNavigationTarget & {
        resetNavigationStack?: boolean;
        focusTitleInput?: boolean;
      },
    ) => {
      const {
        pageId,
        focusTitleInput = false,
        resetNavigationStack = false,
        ...navigationStackItemWithoutId
      } = navigationTarget;

      const computedPageId = pageId || v4();

      const navigationStackItem = {
        ...navigationStackItemWithoutId,
        pageId: computedPageId,
      } satisfies SidePanelNavigationStackItem;

      openSidePanel();

      if (focusTitleInput) {
        store.set(
          sidePanelShouldFocusTitleInputComponentState.atomFamily({
            instanceId: computedPageId,
          }),
          true,
        );
      }

      const isSidePanelClosing = store.get(isSidePanelClosingState.atom);

      const currentNavigationStack = isSidePanelClosing
        ? []
        : store.get(sidePanelNavigationStackState.atom);

      if (resetNavigationStack) {
        store.set(sidePanelNavigationStackState.atom, [navigationStackItem]);
        releaseRemovedRoutedFlowStateScopes({
          removedItems: currentNavigationStack,
          remainingItems: [navigationStackItem],
        });

        store.set(sidePanelNavigationMorphItemsByPageState.atom, new Map());
      } else {
        store.set(sidePanelNavigationStackState.atom, [
          ...currentNavigationStack,
          navigationStackItem,
        ]);
      }
    },
    [openSidePanel, store],
  );

  return {
    navigateSidePanel,
  };
};

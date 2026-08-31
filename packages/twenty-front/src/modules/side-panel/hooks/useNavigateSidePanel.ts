import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { SIDE_PANEL_ARTIFACT_PAGE } from '@/side-panel/constants/SidePanelArtifactPage';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelCloseAnimationCompleteCleanup } from '@/side-panel/hooks/useSidePanelCloseAnimationCompleteCleanup';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import {
  type SidePanelNavigationStackItem,
  type SidePanelNavigationTarget,
  sidePanelNavigationStackState,
} from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelShouldFocusTitleInputComponentState } from '@/side-panel/states/sidePanelShouldFocusTitleInputComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
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
  }, [
    sidePanelCloseAnimationCompleteCleanup,
    pushFocusItemToFocusStack,
    store,
  ]);

  const navigateSidePanel = useCallback(
    (
      params: SidePanelNavigationTarget & {
        resetNavigationStack?: boolean;
        focusTitleInput?: boolean;
      },
    ) => {
      const {
        pageTitle,
        pageIcon,
        pageIconColor,
        pageId,
        focusTitleInput = false,
        resetNavigationStack = false,
      } = params;
      const computedPageId = pageId || v4();

      const navigationStackItemBase = {
        pageTitle,
        pageIcon,
        pageIconColor,
        pageId: computedPageId,
      };

      let navigationStackItem: SidePanelNavigationStackItem;

      if (params.page === SIDE_PANEL_ARTIFACT_PAGE) {
        const artifactPath = params.artifactPath;

        if (!isNonEmptyString(artifactPath)) {
          throw new Error(
            'An artifact side-panel page requires a canonical path',
          );
        }

        navigationStackItem = {
          ...navigationStackItemBase,
          page: SIDE_PANEL_ARTIFACT_PAGE,
          artifactPath,
        };
      } else {
        navigationStackItem = {
          ...navigationStackItemBase,
          page: params.page,
        };
      }

      openSidePanel();
      store.set(sidePanelPageState.atom, params.page);
      store.set(sidePanelPageInfoState.atom, {
        title: pageTitle,
        Icon: pageIcon,
        instanceId: computedPageId,
      });

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

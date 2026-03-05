import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelCloseAnimationCompleteCleanup } from '@/side-panel/hooks/useSidePanelCloseAnimationCompleteCleanup';
import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelShouldFocusTitleInputComponentState } from '@/side-panel/states/sidePanelShouldFocusTitleInputComponentState';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type SidePanelPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';
import { v4 } from 'uuid';

export type SidePanelNavigationStackItem = {
  page: SidePanelPages;
  pageTitle: string;
  pageIcon: IconComponent;
  pageIconColor?: string;
  pageId?: string;
};

export const useNavigateSidePanel = () => {
  const store = useStore();
  const { copyContextStoreStates } = useCopyContextStoreStates();

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

    if (isSidePanelOpened) {
      return;
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

    copyContextStoreStates({
      instanceIdToCopyFrom: MAIN_CONTEXT_STORE_INSTANCE_ID,
      instanceIdToCopyTo: SIDE_PANEL_COMPONENT_INSTANCE_ID,
    });

    store.set(isSidePanelOpenedState.atom, true);
    store.set(hasUserSelectedSidePanelListItemState.atom, false);
  }, [
    copyContextStoreStates,
    sidePanelCloseAnimationCompleteCleanup,
    pushFocusItemToFocusStack,
    store,
  ]);

  const navigateSidePanel = useCallback(
    ({
      page,
      pageTitle,
      pageIcon,
      pageIconColor,
      pageId,
      focusTitleInput = false,
      resetNavigationStack = false,
    }: SidePanelNavigationStackItem & {
      resetNavigationStack?: boolean;
      focusTitleInput?: boolean;
    }) => {
      const computedPageId = pageId || v4();

      openSidePanel();
      store.set(sidePanelPageState.atom, page);
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
        store.set(sidePanelNavigationStackState.atom, [
          {
            page,
            pageTitle,
            pageIcon,
            pageIconColor,
            pageId: computedPageId,
          },
        ]);

        store.set(sidePanelNavigationMorphItemsByPageState.atom, new Map());
      } else {
        store.set(sidePanelNavigationStackState.atom, [
          ...currentNavigationStack,
          {
            page,
            pageTitle,
            pageIcon,
            pageIconColor,
            pageId: computedPageId,
          },
        ]);
      }
    },
    [openSidePanel, store],
  );

  return {
    navigateSidePanel,
  };
};

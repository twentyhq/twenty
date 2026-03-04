import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useSidePanelCloseAnimationCompleteCleanup } from '@/command-menu/hooks/useSidePanelCloseAnimationCompleteCleanup';
import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates';
import { sidePanelNavigationMorphItemsByPageState } from '@/command-menu/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/command-menu/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/command-menu/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/command-menu/states/sidePanelPageState';
import { sidePanelShouldFocusTitleInputComponentState } from '@/command-menu/states/sidePanelShouldFocusTitleInputComponentState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { isSidePanelClosingState } from '@/command-menu/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/command-menu/states/isSidePanelOpenedState';
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

  const { commandMenuCloseAnimationCompleteCleanup } =
    useSidePanelCloseAnimationCompleteCleanup();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openCommandMenu = useCallback(() => {
    const isCommandMenuOpened = store.get(isSidePanelOpenedState.atom);

    const isCommandMenuClosing = store.get(isSidePanelClosingState.atom);

    if (isCommandMenuClosing) {
      commandMenuCloseAnimationCompleteCleanup({
        emitSidePanelCloseEvent: false,
      });
    }

    if (isCommandMenuOpened) {
      return;
    }

    pushFocusItemToFocusStack({
      focusId: SIDE_PANEL_FOCUS_ID,
      component: {
        type: FocusComponentType.SIDE_PANEL,
        instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    copyContextStoreStates({
      instanceIdToCopyFrom: MAIN_CONTEXT_STORE_INSTANCE_ID,
      instanceIdToCopyTo: COMMAND_MENU_COMPONENT_INSTANCE_ID,
    });

    store.set(isSidePanelOpenedState.atom, true);
    store.set(hasUserSelectedCommandState.atom, false);
  }, [
    copyContextStoreStates,
    commandMenuCloseAnimationCompleteCleanup,
    pushFocusItemToFocusStack,
    store,
  ]);

  const navigateCommandMenu = useCallback(
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

      openCommandMenu();
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

      const isCommandMenuClosing = store.get(isSidePanelClosingState.atom);

      const currentNavigationStack = isCommandMenuClosing
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
    [openCommandMenu, store],
  );

  return {
    navigateCommandMenu,
  };
};

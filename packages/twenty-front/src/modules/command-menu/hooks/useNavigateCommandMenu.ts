import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useCommandMenuCloseAnimationCompleteCleanup } from '@/command-menu/hooks/useCommandMenuCloseAnimationCompleteCleanup';
import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useCallback } from 'react';
import { type CommandMenuPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';
import { v4 } from 'uuid';
import { useStore } from 'jotai';

export type CommandMenuNavigationStackItem = {
  page: CommandMenuPages;
  pageTitle: string;
  pageIcon: IconComponent;
  pageIconColor?: string;
  pageId?: string;
};

export const useNavigateCommandMenu = () => {
  const store = useStore();
  const { copyContextStoreStates } = useCopyContextStoreStates();

  const { commandMenuCloseAnimationCompleteCleanup } =
    useCommandMenuCloseAnimationCompleteCleanup();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openCommandMenu = useCallback(() => {
    const isCommandMenuOpened = store.get(isCommandMenuOpenedState.atom);

    const isCommandMenuClosing = store.get(isCommandMenuClosingState.atom);

    if (isCommandMenuClosing) {
      commandMenuCloseAnimationCompleteCleanup();
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

    store.set(isCommandMenuOpenedState.atom, true);
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
    }: CommandMenuNavigationStackItem & {
      resetNavigationStack?: boolean;
      focusTitleInput?: boolean;
    }) => {
      const computedPageId = pageId || v4();

      openCommandMenu();
      store.set(commandMenuPageState.atom, page);
      store.set(commandMenuPageInfoState.atom, {
        title: pageTitle,
        Icon: pageIcon,
        instanceId: computedPageId,
      });

      if (focusTitleInput) {
        store.set(
          commandMenuShouldFocusTitleInputComponentState.atomFamily({
            instanceId: computedPageId,
          }),
          true,
        );
      }

      const isCommandMenuClosing = store.get(isCommandMenuClosingState.atom);

      const currentNavigationStack = isCommandMenuClosing
        ? []
        : store.get(commandMenuNavigationStackState.atom);

      if (resetNavigationStack) {
        store.set(commandMenuNavigationStackState.atom, [
          {
            page,
            pageTitle,
            pageIcon,
            pageIconColor,
            pageId: computedPageId,
          },
        ]);

        store.set(commandMenuNavigationMorphItemsByPageState.atom, new Map());
      } else {
        store.set(commandMenuNavigationStackState.atom, [
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

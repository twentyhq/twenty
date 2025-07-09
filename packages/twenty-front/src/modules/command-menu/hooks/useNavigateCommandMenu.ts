import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useCommandMenuCloseAnimationCompleteCleanup } from '@/command-menu/hooks/useCommandMenuCloseAnimationCompleteCleanup';
import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates';
import { commandMenuNavigationMorphItemByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
import { commandMenuNavigationRecordsState } from '@/command-menu/states/commandMenuNavigationRecordsState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { isDragSelectionStartEnabledState } from '@/ui/utilities/drag-select/states/internal/isDragSelectionStartEnabledState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';
import { IconComponent } from 'twenty-ui/display';
import { v4 } from 'uuid';

export type CommandMenuNavigationStackItem = {
  page: CommandMenuPages;
  pageTitle: string;
  pageIcon: IconComponent;
  pageIconColor?: string;
  pageId?: string;
};

export const useNavigateCommandMenu = () => {
  const { copyContextStoreStates } = useCopyContextStoreStates();

  const { commandMenuCloseAnimationCompleteCleanup } =
    useCommandMenuCloseAnimationCompleteCleanup();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const openCommandMenu = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        const isCommandMenuClosing = snapshot
          .getLoadable(isCommandMenuClosingState)
          .getValue();

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

        set(isCommandMenuOpenedState, true);
        set(hasUserSelectedCommandState, false);
        set(isDragSelectionStartEnabledState, false);
      },
    [
      copyContextStoreStates,
      commandMenuCloseAnimationCompleteCleanup,
      pushFocusItemToFocusStack,
    ],
  );

  const navigateCommandMenu = useRecoilCallback(
    ({ snapshot, set }) => {
      return ({
        page,
        pageTitle,
        pageIcon,
        pageIconColor,
        pageId,
        resetNavigationStack = false,
      }: CommandMenuNavigationStackItem & {
        resetNavigationStack?: boolean;
      }) => {
        const computedPageId = pageId || v4();

        openCommandMenu();
        set(commandMenuPageState, page);
        set(commandMenuPageInfoState, {
          title: pageTitle,
          Icon: pageIcon,
          instanceId: computedPageId,
        });

        const isCommandMenuClosing = snapshot
          .getLoadable(isCommandMenuClosingState)
          .getValue();

        const currentNavigationStack = isCommandMenuClosing
          ? []
          : snapshot.getLoadable(commandMenuNavigationStackState).getValue();

        if (resetNavigationStack) {
          set(commandMenuNavigationStackState, [
            {
              page,
              pageTitle,
              pageIcon,
              pageIconColor,
              pageId: computedPageId,
            },
          ]);

          set(commandMenuNavigationRecordsState, []);
          set(commandMenuNavigationMorphItemByPageState, new Map());
        } else {
          set(commandMenuNavigationStackState, [
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
      };
    },
    [openCommandMenu],
  );

  return {
    navigateCommandMenu,
  };
};

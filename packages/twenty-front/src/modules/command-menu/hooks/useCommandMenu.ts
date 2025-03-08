import { useRecoilCallback } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import {
  IconBolt,
  IconCalendarEvent,
  IconComponent,
  IconDotsVertical,
  IconMail,
  IconSearch,
  IconSettingsAutomation,
  useIcons,
} from 'twenty-ui';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID } from '@/command-menu/constants/CommandMenuContextChipGroupsDropdownId';
import { COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuPreviousComponentInstanceId';
import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates';
import { useResetContextStoreStates } from '@/command-menu/hooks/useResetContextStoreStates';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { workflowIdComponentState } from '@/command-menu/pages/workflow/states/workflowIdComponentState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { emitRightDrawerCloseEvent } from '@/ui/layout/right-drawer/utils/emitRightDrawerCloseEvent';
import { isDragSelectionStartEnabledState } from '@/ui/utilities/drag-select/states/internal/isDragSelectionStartEnabledState';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { capitalize, isDefined } from 'twenty-shared';
import { v4 } from 'uuid';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';

export type CommandMenuNavigationStackItem = {
  page: CommandMenuPages;
  pageTitle: string;
  pageIcon: IconComponent;
  pageId?: string;
};

export const useCommandMenu = () => {
  const { resetSelectedItem } = useSelectableList('command-menu-list');
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const { getIcon } = useIcons();

  const { copyContextStoreStates } = useCopyContextStoreStates();
  const { resetContextStoreStates } = useResetContextStoreStates();

  const { closeDropdown } = useDropdownV2();

  const closeCommandMenu = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isCommandMenuOpenedState, false);
        set(isCommandMenuClosingState, true);
        set(isDragSelectionStartEnabledState, true);
      },
    [],
  );

  const onCommandMenuCloseAnimationComplete = useRecoilCallback(
    ({ set }) =>
      () => {
        closeDropdown(COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID);

        resetContextStoreStates(COMMAND_MENU_COMPONENT_INSTANCE_ID);
        resetContextStoreStates(COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID);

        set(viewableRecordIdState, null);
        set(commandMenuPageState, CommandMenuPages.Root);
        set(commandMenuPageInfoState, {
          title: undefined,
          Icon: undefined,
          instanceId: '',
        });
        set(isCommandMenuOpenedState, false);
        set(commandMenuSearchState, '');
        set(commandMenuNavigationStackState, []);
        resetSelectedItem();
        set(hasUserSelectedCommandState, false);
        goBackToPreviousHotkeyScope();

        emitRightDrawerCloseEvent();
        set(isCommandMenuClosingState, false);
      },
    [
      closeDropdown,
      goBackToPreviousHotkeyScope,
      resetContextStoreStates,
      resetSelectedItem,
    ],
  );

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
          onCommandMenuCloseAnimationComplete();
        }

        setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenuOpen);

        if (isCommandMenuOpened) {
          return;
        }

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
      onCommandMenuCloseAnimationComplete,
      setHotkeyScopeAndMemorizePreviousScope,
    ],
  );

  const navigateCommandMenu = useRecoilCallback(
    ({ snapshot, set }) => {
      return ({
        page,
        pageTitle,
        pageIcon,
        pageId,
        resetNavigationStack = false,
      }: CommandMenuNavigationStackItem & {
        resetNavigationStack?: boolean;
      }) => {
        if (!pageId) {
          pageId = v4();
        }

        openCommandMenu();
        set(commandMenuPageState, page);
        set(commandMenuPageInfoState, {
          title: pageTitle,
          Icon: pageIcon,
          instanceId: pageId,
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
              pageId,
            },
          ]);
        } else {
          set(commandMenuNavigationStackState, [
            ...currentNavigationStack,
            {
              page,
              pageTitle,
              pageIcon,
              pageId,
            },
          ]);
        }
      };
    },
    [openCommandMenu],
  );

  const openRootCommandMenu = useCallback(() => {
    navigateCommandMenu({
      page: CommandMenuPages.Root,
      pageTitle: 'Command Menu',
      pageIcon: IconDotsVertical,
      resetNavigationStack: true,
    });
  }, [navigateCommandMenu]);

  const toggleCommandMenu = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        set(commandMenuSearchState, '');

        if (isCommandMenuOpened) {
          closeCommandMenu();
        } else {
          openRootCommandMenu();
        }
      },
    [closeCommandMenu, openRootCommandMenu],
  );

  const goBackFromCommandMenu = useRecoilCallback(
    ({ snapshot, set }) => {
      return () => {
        const currentNavigationStack = snapshot
          .getLoadable(commandMenuNavigationStackState)
          .getValue();

        const newNavigationStack = currentNavigationStack.slice(0, -1);
        const lastNavigationStackItem = newNavigationStack.at(-1);

        if (!isDefined(lastNavigationStackItem)) {
          closeCommandMenu();
          return;
        }

        set(commandMenuPageState, lastNavigationStackItem.page);

        set(commandMenuPageInfoState, {
          title: lastNavigationStackItem.pageTitle,
          Icon: lastNavigationStackItem.pageIcon,
          instanceId: lastNavigationStackItem.pageId,
        });

        set(commandMenuNavigationStackState, newNavigationStack);
        set(hasUserSelectedCommandState, false);
      };
    },
    [closeCommandMenu],
  );

  const navigateCommandMenuHistory = useRecoilCallback(({ snapshot, set }) => {
    return (pageIndex: number) => {
      const currentNavigationStack = snapshot
        .getLoadable(commandMenuNavigationStackState)
        .getValue();

      const newNavigationStack = currentNavigationStack.slice(0, pageIndex + 1);

      set(commandMenuNavigationStackState, newNavigationStack);

      const newNavigationStackItem = newNavigationStack.at(-1);

      if (!isDefined(newNavigationStackItem)) {
        throw new Error(
          `No command menu navigation stack item found for index ${pageIndex}`,
        );
      }

      set(commandMenuPageState, newNavigationStackItem?.page);
      set(commandMenuPageInfoState, {
        title: newNavigationStackItem?.pageTitle,
        Icon: newNavigationStackItem?.pageIcon,
        instanceId: newNavigationStackItem?.pageId,
      });

      set(hasUserSelectedCommandState, false);
    };
  }, []);

  const openRecordInCommandMenu = useRecoilCallback(
    ({ set, snapshot }) => {
      return ({
        recordId,
        objectNameSingular,
        isNewRecord = false,
      }: {
        recordId: string;
        objectNameSingular: string;
        isNewRecord?: boolean;
      }) => {
        const pageComponentInstanceId = v4();

        set(
          viewableRecordNameSingularComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          objectNameSingular,
        );
        set(
          viewableRecordIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          recordId,
        );
        set(viewableRecordIdState, recordId);

        const objectMetadataItem = snapshot
          .getLoadable(
            objectMetadataItemFamilySelector({
              objectName: objectNameSingular,
              objectNameType: 'singular',
            }),
          )
          .getValue();

        if (!objectMetadataItem) {
          throw new Error(
            `No object metadata item found for object name ${objectNameSingular}`,
          );
        }

        set(
          contextStoreCurrentObjectMetadataItemComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          objectMetadataItem,
        );

        set(
          contextStoreTargetedRecordsRuleComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          {
            mode: 'selection',
            selectedRecordIds: [recordId],
          },
        );

        set(
          contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          1,
        );

        set(
          contextStoreCurrentViewTypeComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          ContextStoreViewType.ShowPage,
        );

        set(
          contextStoreCurrentViewIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          snapshot
            .getLoadable(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
              }),
            )
            .getValue(),
        );

        const Icon = objectMetadataItem?.icon
          ? getIcon(objectMetadataItem.icon)
          : getIcon('IconList');

        const capitalizedObjectNameSingular = capitalize(objectNameSingular);

        navigateCommandMenu({
          page: CommandMenuPages.ViewRecord,
          pageTitle: isNewRecord
            ? t`New ${capitalizedObjectNameSingular}`
            : capitalizedObjectNameSingular,
          pageIcon: Icon,
          pageId: pageComponentInstanceId,
          resetNavigationStack: false,
        });
      };
    },
    [getIcon, navigateCommandMenu],
  );

  const openWorkflowTriggerTypeInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (workflowId: string) => {
        const pageId = v4();

        set(
          workflowIdComponentState.atomFamily({ instanceId: pageId }),
          workflowId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.WorkflowStepSelectTriggerType,
          pageTitle: t`Trigger Type`,
          pageIcon: IconBolt,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const openWorkflowActionInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (workflowId: string) => {
        const pageId = v4();

        set(
          workflowIdComponentState.atomFamily({ instanceId: pageId }),
          workflowId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.WorkflowStepSelectAction,
          pageTitle: t`Select Action`,
          pageIcon: IconSettingsAutomation,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const openWorkflowEditStepInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (workflowId: string, title: string, icon: IconComponent) => {
        const pageId = v4();

        set(
          workflowIdComponentState.atomFamily({ instanceId: pageId }),
          workflowId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.WorkflowStepEdit,
          pageTitle: title,
          pageIcon: icon,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const openWorkflowViewStepInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (workflowId: string, title: string, icon: IconComponent) => {
        const pageId = v4();

        set(
          workflowIdComponentState.atomFamily({ instanceId: pageId }),
          workflowId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.WorkflowStepView,
          pageTitle: title,
          pageIcon: icon,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const openWorkflowViewRunStepInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (workflowId: string, title: string, icon: IconComponent) => {
        const pageId = v4();

        set(
          workflowIdComponentState.atomFamily({ instanceId: pageId }),
          workflowId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.WorkflowRunStepView,
          pageTitle: title,
          pageIcon: icon,
          pageId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const openRecordsSearchPage = () => {
    navigateCommandMenu({
      page: CommandMenuPages.SearchRecords,
      pageTitle: 'Search',
      pageIcon: IconSearch,
      pageId: v4(),
    });
  };

  const openCalendarEventInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (calendarEventId: string) => {
        const pageComponentInstanceId = v4();

        set(
          viewableRecordIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          calendarEventId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.ViewCalendarEvent,
          pageTitle: 'Calendar Event',
          pageIcon: IconCalendarEvent,
          pageId: pageComponentInstanceId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const openEmailThreadInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (emailThreadId: string) => {
        const pageComponentInstanceId = v4();

        set(
          viewableRecordIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          emailThreadId,
        );

        navigateCommandMenu({
          page: CommandMenuPages.ViewEmailThread,
          pageTitle: 'Email Thread',
          pageIcon: IconMail,
          pageId: pageComponentInstanceId,
        });
      };
    },
    [navigateCommandMenu],
  );

  const setGlobalCommandMenuContext = useRecoilCallback(
    ({ set }) => {
      return () => {
        copyContextStoreStates({
          instanceIdToCopyFrom: COMMAND_MENU_COMPONENT_INSTANCE_ID,
          instanceIdToCopyTo: COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID,
        });

        set(
          contextStoreTargetedRecordsRuleComponentState.atomFamily({
            instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
          }),
          {
            mode: 'selection',
            selectedRecordIds: [],
          },
        );

        set(
          contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
            instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
          }),
          0,
        );

        set(
          contextStoreFiltersComponentState.atomFamily({
            instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
          }),
          [],
        );

        set(
          contextStoreCurrentViewTypeComponentState.atomFamily({
            instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
          }),
          ContextStoreViewType.Table,
        );

        set(commandMenuPageInfoState, {
          title: undefined,
          Icon: undefined,
          instanceId: '',
        });

        set(hasUserSelectedCommandState, false);
      };
    },
    [copyContextStoreStates],
  );

  return {
    openRootCommandMenu,
    closeCommandMenu,
    onCommandMenuCloseAnimationComplete,
    navigateCommandMenu,
    navigateCommandMenuHistory,
    goBackFromCommandMenu,
    openRecordsSearchPage,
    openRecordInCommandMenu,
    toggleCommandMenu,
    setGlobalCommandMenuContext,
    openCalendarEventInCommandMenu,
    openEmailThreadInCommandMenu,
    openWorkflowTriggerTypeInCommandMenu,
    openWorkflowActionInCommandMenu,
    openWorkflowEditStepInCommandMenu,
    openWorkflowViewStepInCommandMenu,
    openWorkflowViewRunStepInCommandMenu,
  };
};

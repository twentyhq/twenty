import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID } from '@/command-menu/constants/CommandMenuContextChipGroupsDropdownId';
import { COMMAND_MENU_LIST_SELECTABLE_LIST_ID } from '@/command-menu/constants/CommandMenuListSelectableListId';
import { COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuPreviousComponentInstanceId';
import { useResetContextStoreStates } from '@/command-menu/hooks/useResetContextStoreStates';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { emitSidePanelCloseEvent } from '@/ui/layout/right-drawer/utils/emitSidePanelCloseEvent';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/code-action/constants/WorkflowLogicFunctionTabListComponentId';
import { WorkflowLogicFunctionTabId } from '@/workflow/workflow-steps/workflow-actions/code-action/types/WorkflowLogicFunctionTabId';
import { useCallback } from 'react';
import { CommandMenuPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';

export const useCommandMenuCloseAnimationCompleteCleanup = () => {
  const store = useStore();
  const { resetSelectedItem } = useSelectableList(
    COMMAND_MENU_LIST_SELECTABLE_LIST_ID,
  );

  const { resetContextStoreStates } = useResetContextStoreStates();

  const { closeDropdown } = useCloseDropdown();

  const commandMenuCloseAnimationCompleteCleanup = useCallback(() => {
    closeDropdown(COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID);

    resetContextStoreStates(COMMAND_MENU_COMPONENT_INSTANCE_ID);
    resetContextStoreStates(COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID);

    const currentPage = store.get(commandMenuPageState.atom);

    const isPageLayoutEditingPage =
      currentPage === CommandMenuPages.PageLayoutWidgetTypeSelect ||
      currentPage === CommandMenuPages.PageLayoutGraphTypeSelect ||
      currentPage === CommandMenuPages.PageLayoutIframeSettings ||
      currentPage === CommandMenuPages.PageLayoutTabSettings;

    if (isPageLayoutEditingPage) {
      const targetedRecordsRule = store.get(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
        }),
      );

      if (
        targetedRecordsRule.mode === 'selection' &&
        targetedRecordsRule.selectedRecordIds.length === 1
      ) {
        const recordId = targetedRecordsRule.selectedRecordIds[0];
        const record = store.get(recordStoreFamilyState.atomFamily(recordId));

        if (isDefined(record) && isDefined(record.pageLayoutId)) {
          store.set(
            pageLayoutEditingWidgetIdComponentState.atomFamily({
              instanceId: record.pageLayoutId,
            }),
            null,
          );
          store.set(
            pageLayoutTabSettingsOpenTabIdComponentState.atomFamily({
              instanceId: record.pageLayoutId,
            }),
            null,
          );
          store.set(
            pageLayoutDraggedAreaComponentState.atomFamily({
              instanceId: record.pageLayoutId,
            }),
            null,
          );
        }
      }
    }

    store.set(viewableRecordIdState.atom, null);
    store.set(commandMenuPageState.atom, CommandMenuPages.Root);
    store.set(commandMenuPageInfoState.atom, {
      title: undefined,
      Icon: undefined,
      instanceId: '',
    });
    store.set(isCommandMenuOpenedState.atom, false);
    store.set(commandMenuSearchState.atom, '');
    store.set(commandMenuNavigationMorphItemsByPageState.atom, new Map());
    store.set(commandMenuNavigationStackState.atom, []);
    resetSelectedItem();
    store.set(hasUserSelectedCommandState.atom, false);

    emitSidePanelCloseEvent();
    store.set(isCommandMenuClosingState.atom, false);
    store.set(
      activeTabIdComponentState.atomFamily({
        instanceId: WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID,
      }),
      WorkflowLogicFunctionTabId.CODE,
    );

    const morphItemsByPage = store.get(
      commandMenuNavigationMorphItemsByPageState.atom,
    );

    for (const [pageId, morphItems] of morphItemsByPage) {
      store.set(
        activeTabIdComponentState.atomFamily({
          instanceId: getShowPageTabListComponentId({
            pageId,
            targetObjectId: morphItems[0].recordId,
          }),
        }),
        null,
      );
    }
  }, [closeDropdown, resetContextStoreStates, resetSelectedItem, store]);

  return {
    commandMenuCloseAnimationCompleteCleanup,
  };
};

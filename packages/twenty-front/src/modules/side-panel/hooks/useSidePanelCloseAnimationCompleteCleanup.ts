import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/common/states/addToNavPayloadRegistryState';
import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { viewableRecordIdState } from '@/object-record/record-side-panel/states/viewableRecordIdState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import { SIDE_PANEL_CONTEXT_CHIP_GROUPS_DROPDOWN_ID } from '@/side-panel/constants/SidePanelContextChipGroupsDropdownId';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { isPageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/utils/isPageLayoutSidePanelPage';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { sidePanelShowHiddenObjectsState } from '@/side-panel/states/sidePanelShowHiddenObjectsState';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { emitSidePanelCloseEvent } from '@/ui/layout/side-panel/utils/emitSidePanelCloseEvent';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/code-action/constants/WorkflowLogicFunctionTabListComponentId';
import { WorkflowLogicFunctionTabId } from '@/workflow/workflow-steps/workflow-actions/code-action/types/WorkflowLogicFunctionTabId';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useSidePanelCloseAnimationCompleteCleanup = () => {
  const store = useStore();
  const { resetSelectedItem } = useSelectableList(
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );

  const { closeDropdown } = useCloseDropdown();

  const sidePanelCloseAnimationCompleteCleanup = useCallback(
    (options?: { emitSidePanelCloseEvent?: boolean }) => {
      closeDropdown(SIDE_PANEL_CONTEXT_CHIP_GROUPS_DROPDOWN_ID);

      // Snapshot values before any mutations (Jotai store.get is live and
      // reflects the latest state, so we capture before mutating).
      const currentPage = store.get(sidePanelPageState.atom);
      const morphItemsByPage = store.get(
        sidePanelNavigationMorphItemsByPageState.atom,
      );

      if (isDefined(currentPage) && isPageLayoutSidePanelPage(currentPage)) {
        const targetedRecordsRule = store.get(
          contextStoreTargetedRecordsRuleComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
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
            store.set(
              widgetInsertionContextComponentState.atomFamily({
                instanceId: record.pageLayoutId,
              }),
              null,
            );
          }
        }
      }

      store.set(viewableRecordIdState.atom, null);
      store.set(sidePanelPageState.atom, SidePanelPages.CommandMenuDisplay);
      store.set(sidePanelPageInfoState.atom, {
        title: undefined,
        Icon: undefined,
        instanceId: '',
      });
      store.set(isSidePanelOpenedState.atom, false);
      store.set(sidePanelSearchState.atom, '');
      store.set(sidePanelSearchObjectFilterState.atom, null);
      store.set(sidePanelShowHiddenObjectsState.atom, false);
      store.set(sidePanelNavigationMorphItemsByPageState.atom, new Map());
      store.set(sidePanelNavigationStackState.atom, []);
      store.set(selectedNavigationMenuItemIdInEditModeState.atom, null);
      store.set(pendingInsertionNavigationMenuItemState.atom, null);
      store.set(addToNavPayloadRegistryState.atom, new Map());
      resetSelectedItem();
      store.set(hasUserSelectedSidePanelListItemState.atom, false);

      if (options?.emitSidePanelCloseEvent !== false) {
        emitSidePanelCloseEvent();
      }
      store.set(isSidePanelClosingState.atom, false);
      store.set(
        activeTabIdComponentState.atomFamily({
          instanceId: WORKFLOW_LOGIC_FUNCTION_TAB_LIST_COMPONENT_ID,
        }),
        WorkflowLogicFunctionTabId.CODE,
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
    },
    [closeDropdown, resetSelectedItem, store],
  );

  return {
    sidePanelCloseAnimationCompleteCleanup,
  };
};

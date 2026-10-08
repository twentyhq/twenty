import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import { SIDE_PANEL_CONTEXT_CHIP_GROUPS_DROPDOWN_ID } from '@/side-panel/constants/SidePanelContextChipGroupsDropdownId';
import { SIDE_PANEL_SELECTABLE_LIST_ID } from '@/side-panel/constants/SidePanelSelectableListId';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
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
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { releaseRemovedRoutedFlowStateScopes } from '@/side-panel/routing/utils/releaseRemovedRoutedFlowStateScopes';

export const useSidePanelCloseAnimationCompleteCleanup = () => {
  const store = useStore();
  const { resetSelectedItem } = useSelectableList(
    SIDE_PANEL_SELECTABLE_LIST_ID,
  );

  const { closeDropdown } = useCloseDropdown();

  const sidePanelCloseAnimationCompleteCleanup = useCallback(
    (options?: { emitSidePanelCloseEvent?: boolean }) => {
      closeDropdown(SIDE_PANEL_CONTEXT_CHIP_GROUPS_DROPDOWN_ID);

      // store.get is live, so snapshot before mutating
      const currentNavigationStack = store.get(
        sidePanelNavigationStackState.atom,
      );
      const pageLayoutSidePanelTarget =
        currentNavigationStack.at(-1)?.pageLayoutSidePanelTarget;
      const morphItemsByPage = store.get(
        sidePanelNavigationMorphItemsByPageState.atom,
      );

      // Record pages keep the edited widget selected once the panel closes,
      // e.g. a widget just added from the widget picker
      if (
        isDefined(pageLayoutSidePanelTarget) &&
        pageLayoutSidePanelTarget.targetRecordIdentifier
          .targetObjectNameSingular === CoreObjectNameSingular.Dashboard
      ) {
        const { pageLayoutId } = pageLayoutSidePanelTarget;

        store.set(
          pageLayoutEditingWidgetIdComponentState.atomFamily({
            instanceId: pageLayoutId,
          }),
          null,
        );
        store.set(
          pageLayoutTabSettingsOpenTabIdComponentState.atomFamily({
            instanceId: pageLayoutId,
          }),
          null,
        );
        store.set(
          pageLayoutDraggedAreaComponentState.atomFamily({
            instanceId: pageLayoutId,
          }),
          null,
        );
        store.set(
          widgetInsertionContextComponentState.atomFamily({
            instanceId: pageLayoutId,
          }),
          null,
        );
      }

      store.set(isSidePanelOpenedState.atom, false);
      store.set(sidePanelSearchState.atom, '');
      store.set(sidePanelSearchObjectFilterState.atom, null);
      store.set(sidePanelShowHiddenObjectsState.atom, false);
      store.set(sidePanelNavigationMorphItemsByPageState.atom, new Map());
      store.set(sidePanelNavigationStackState.atom, []);
      releaseRemovedRoutedFlowStateScopes({
        removedItems: currentNavigationStack,
        remainingItems: [],
      });
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

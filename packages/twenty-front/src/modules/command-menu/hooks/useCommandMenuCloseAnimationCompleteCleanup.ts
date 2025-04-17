import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { COMMAND_MENU_CONTEXT_CHIP_GROUPS_DROPDOWN_ID } from '@/command-menu/constants/CommandMenuContextChipGroupsDropdownId';
import { COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuPreviousComponentInstanceId';
import { useResetContextStoreStates } from '@/command-menu/hooks/useResetContextStoreStates';
import { commandMenuNavigationMorphItemByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
import { commandMenuNavigationRecordsState } from '@/command-menu/states/commandMenuNavigationRecordsState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { emitRightDrawerCloseEvent } from '@/ui/layout/right-drawer/utils/emitRightDrawerCloseEvent';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/constants/WorkflowRunStepSidePanelTabListComponentId';
import { WORKFLOW_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/code-action/constants/WorkflowServerlessFunctionTabListComponentId';
import { WorkflowServerlessFunctionTabId } from '@/workflow/workflow-steps/workflow-actions/code-action/types/WorkflowServerlessFunctionTabId';
import { useRecoilCallback } from 'recoil';

export const useCommandMenuCloseAnimationCompleteCleanup = () => {
  const { resetSelectedItem } = useSelectableList('command-menu-list');

  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope(
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const { resetContextStoreStates } = useResetContextStoreStates();

  const { closeDropdown } = useDropdownV2();

  const commandMenuCloseAnimationCompleteCleanup = useRecoilCallback(
    ({ snapshot, set }) =>
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
        set(commandMenuNavigationMorphItemByPageState, new Map());
        set(commandMenuNavigationRecordsState, []);
        set(commandMenuNavigationStackState, []);
        resetSelectedItem();
        set(hasUserSelectedCommandState, false);
        goBackToPreviousHotkeyScope();

        emitRightDrawerCloseEvent();
        set(isCommandMenuClosingState, false);
        set(
          activeTabIdComponentState.atomFamily({
            instanceId: WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID,
          }),
          null,
        );
        set(
          activeTabIdComponentState.atomFamily({
            instanceId: WORKFLOW_SERVERLESS_FUNCTION_TAB_LIST_COMPONENT_ID,
          }),
          WorkflowServerlessFunctionTabId.CODE,
        );

        for (const [pageId, morphItem] of snapshot
          .getLoadable(commandMenuNavigationMorphItemByPageState)
          .getValue()) {
          set(
            activeTabIdComponentState.atomFamily({
              instanceId: getShowPageTabListComponentId({
                pageId,
                targetObjectId: morphItem.recordId,
              }),
            }),
            null,
          );
        }
      },
    [
      closeDropdown,
      goBackToPreviousHotkeyScope,
      resetContextStoreStates,
      resetSelectedItem,
    ],
  );

  return {
    commandMenuCloseAnimationCompleteCleanup,
  };
};

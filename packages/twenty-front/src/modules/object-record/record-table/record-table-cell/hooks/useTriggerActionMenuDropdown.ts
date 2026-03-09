import { useCallback } from 'react';
import { useStore } from 'jotai';

import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { recordIndexCommandMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownPositionComponentState';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';

export const useTriggerActionMenuDropdown = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const actionMenuInstanceId = useAvailableComponentInstanceIdOrThrow(
    CommandMenuComponentInstanceContext,
  );

  const isRowSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const actionMenuDropdownId =
    getCommandMenuDropdownIdFromCommandMenuId(actionMenuInstanceId);

  const recordIndexCommandMenuDropdownPositionCallbackState =
    useAtomComponentStateCallbackState(
      recordIndexCommandMenuDropdownPositionComponentState,
      actionMenuDropdownId,
    );

  const { openDropdown } = useOpenDropdown();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const store = useStore();

  const triggerActionMenuDropdown = useCallback(
    (event: React.MouseEvent, recordId: string) => {
      event.preventDefault();

      store.set(recordIndexCommandMenuDropdownPositionCallbackState, {
        x: event.pageX,
        y: event.pageY,
      });

      const isRowSelected = store.get(isRowSelectedFamilyState(recordId));

      if (isRowSelected !== true) {
        store.set(isRowSelectedFamilyState(recordId), true);
      }

      closeSidePanelMenu();

      openDropdown({
        dropdownComponentInstanceIdFromProps: actionMenuDropdownId,
      });
    },
    [
      recordIndexCommandMenuDropdownPositionCallbackState,
      isRowSelectedFamilyState,
      closeSidePanelMenu,
      openDropdown,
      actionMenuDropdownId,
      store,
    ],
  );

  return { triggerActionMenuDropdown };
};

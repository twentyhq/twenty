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

export const useTriggerCommandMenuDropdown = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const commandMenuInstanceId = useAvailableComponentInstanceIdOrThrow(
    CommandMenuComponentInstanceContext,
  );

  const isRowSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const commandMenuDropdownId = getCommandMenuDropdownIdFromCommandMenuId(
    commandMenuInstanceId,
  );

  const recordIndexCommandMenuDropdownPositionCallbackState =
    useAtomComponentStateCallbackState(
      recordIndexCommandMenuDropdownPositionComponentState,
      commandMenuDropdownId,
    );

  const { openDropdown } = useOpenDropdown();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const store = useStore();

  const triggerCommandMenuDropdown = useCallback(
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
        dropdownComponentInstanceIdFromProps: commandMenuDropdownId,
      });
    },
    [
      recordIndexCommandMenuDropdownPositionCallbackState,
      isRowSelectedFamilyState,
      closeSidePanelMenu,
      openDropdown,
      commandMenuDropdownId,
      store,
    ],
  );

  return { triggerCommandMenuDropdown };
};

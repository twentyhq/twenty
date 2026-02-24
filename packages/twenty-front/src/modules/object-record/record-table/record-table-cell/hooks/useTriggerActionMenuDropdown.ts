import { useCallback } from 'react';
import { useStore } from 'jotai';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';

export const useTriggerActionMenuDropdown = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const actionMenuInstanceId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const isRowSelectedFamilyState = useRecoilComponentFamilyStateCallbackStateV2(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const actionMenuDropdownId =
    getActionMenuDropdownIdFromActionMenuId(actionMenuInstanceId);

  const recordIndexActionMenuDropdownPositionCallbackState =
    useRecoilComponentStateCallbackStateV2(
      recordIndexActionMenuDropdownPositionComponentState,
      actionMenuDropdownId,
    );

  const { openDropdown } = useOpenDropdown();
  const { closeCommandMenu } = useCommandMenu();
  const store = useStore();

  const triggerActionMenuDropdown = useCallback(
    (event: React.MouseEvent, recordId: string) => {
      event.preventDefault();

      store.set(recordIndexActionMenuDropdownPositionCallbackState, {
        x: event.pageX,
        y: event.pageY,
      });

      const isRowSelected = store.get(isRowSelectedFamilyState(recordId));

      if (isRowSelected !== true) {
        store.set(isRowSelectedFamilyState(recordId), true);
      }

      closeCommandMenu();

      openDropdown({
        dropdownComponentInstanceIdFromProps: actionMenuDropdownId,
      });
    },
    [
      recordIndexActionMenuDropdownPositionCallbackState,
      isRowSelectedFamilyState,
      closeCommandMenu,
      openDropdown,
      actionMenuDropdownId,
      store,
    ],
  );

  return { triggerActionMenuDropdown };
};

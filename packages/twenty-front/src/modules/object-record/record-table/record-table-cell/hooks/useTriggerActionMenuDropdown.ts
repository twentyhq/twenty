import { useRecoilCallback } from 'recoil';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/action-menu/states/recordIndexActionMenuDropdownPositionComponentState';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useTriggerActionMenuDropdown = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const actionMenuInstanceId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const isRowSelectedFamilyState = useRecoilComponentCallbackState(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const actionMenuDropdownId =
    getActionMenuDropdownIdFromActionMenuId(actionMenuInstanceId);

  const recordIndexActionMenuDropdownPositionCallbackState =
    useRecoilComponentCallbackState(
      recordIndexActionMenuDropdownPositionComponentState,
      actionMenuDropdownId,
    );

  const { openDropdown } = useOpenDropdown();

  const { closeCommandMenu } = useCommandMenu();

  const triggerActionMenuDropdown = useRecoilCallback(
    ({ set, snapshot }) =>
      (event: React.MouseEvent, recordId: string) => {
        event.preventDefault();

        set(recordIndexActionMenuDropdownPositionCallbackState, {
          x: event.pageX,
          y: event.pageY,
        });

        const isRowSelected = getSnapshotValue(
          snapshot,
          isRowSelectedFamilyState(recordId),
        );

        if (isRowSelected !== true) {
          set(isRowSelectedFamilyState(recordId), true);
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
    ],
  );

  return { triggerActionMenuDropdown };
};

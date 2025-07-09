import { ACTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/action-menu/constants/ActionMenuDropdownClickOutsideId';
import { COMMAND_MENU_CLICK_OUTSIDE_ID } from '@/command-menu/constants/CommandMenuClickOutsideId';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useLeaveTableFocus } from '@/object-record/record-table/hooks/internal/useLeaveTableFocus';
import { MODAL_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/modal/constants/ModalBackdropClickOutsideId';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
type RecordTableBodyFocusClickOutsideEffectProps = {
  tableBodyRef: React.RefObject<HTMLDivElement>;
};

export const RecordTableBodyFocusClickOutsideEffect = ({
  tableBodyRef,
}: RecordTableBodyFocusClickOutsideEffectProps) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const leaveTableFocus = useLeaveTableFocus(recordTableId);

  useListenClickOutside({
    excludedClickOutsideIds: [
      ACTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID,
      COMMAND_MENU_CLICK_OUTSIDE_ID,
      PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID,
      MODAL_BACKDROP_CLICK_OUTSIDE_ID,
    ],
    listenerId: RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
    refs: [tableBodyRef],
    callback: () => {
      leaveTableFocus();
    },
  });

  return <></>;
};

import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useLeaveTableFocus } from '@/object-record/record-table/hooks/internal/useLeaveTableFocus';
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
    excludeClassNames: [
      'bottom-bar',
      'action-menu-dropdown',
      'command-menu',
      'modal-backdrop',
      'page-action-container',
    ],
    listenerId: RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
    refs: [tableBodyRef],
    callback: () => {
      leaveTableFocus();
    },
  });

  return <></>;
};

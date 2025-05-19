import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useLeaveTableFocus } from '@/object-record/record-table/hooks/internal/useLeaveTableFocus';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRecoilValue } from 'recoil';
type RecordTableBodyFocusClickOutsideEffectProps = {
  tableBodyRef: React.RefObject<HTMLDivElement>;
};

export const RecordTableBodyFocusClickOutsideEffect = ({
  tableBodyRef,
}: RecordTableBodyFocusClickOutsideEffectProps) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const leaveTableFocus = useLeaveTableFocus(recordTableId);

  const currentHotkeyScope = useRecoilValue(currentHotkeyScopeState);

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
      if (
        currentHotkeyScope.scope !== TableHotkeyScope.TableFocus &&
        currentHotkeyScope.scope !== RecordIndexHotkeyScope.RecordIndex
      ) {
        return;
      }

      leaveTableFocus();
    },
  });

  return <></>;
};

import { RecordTableBodyEscapeHotkeyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyEscapeHotkeyEffect';
import { RecordTableBodyFocusClickOutsideEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyFocusClickOutsideEffect';
import { RecordTableBodyFocusKeyboardEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyFocusKeyboardEffect';
import { RecordTableNoRecordGroupBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBodyEffect';
import { RecordTableRecordGroupBodyEffects } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupBodyEffects';
import { isAtLeastOneTableRowSelectedSelector } from '@/object-record/record-table/record-table-row/states/isAtLeastOneTableRowSelectedSelector';
import { isRecordTableFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableFocusActiveComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export interface RecordTableBodyEffectsWrapperProps {
  hasRecordGroups: boolean;
  tableBodyRef: React.RefObject<HTMLTableElement>;
}

export const RecordTableBodyEffectsWrapper = ({
  hasRecordGroups,
  tableBodyRef,
}: RecordTableBodyEffectsWrapperProps) => {
  const isAtLeastOneRecordSelected = useRecoilComponentValueV2(
    isAtLeastOneTableRowSelectedSelector,
  );

  const isRecordTableFocusActive = useRecoilComponentValueV2(
    isRecordTableFocusActiveComponentState,
  );

  return (
    <>
      {hasRecordGroups ? (
        <RecordTableRecordGroupBodyEffects />
      ) : (
        <RecordTableNoRecordGroupBodyEffect />
      )}
      {isAtLeastOneRecordSelected && <RecordTableBodyEscapeHotkeyEffect />}
      {isRecordTableFocusActive && <RecordTableBodyFocusKeyboardEffect />}
      {isRecordTableFocusActive && (
        <RecordTableBodyFocusClickOutsideEffect tableBodyRef={tableBodyRef} />
      )}
    </>
  );
};

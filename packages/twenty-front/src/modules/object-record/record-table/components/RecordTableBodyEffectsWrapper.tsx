import { RecordTableBodyEscapeHotkeyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodyEscapeHotkeyEffect';
import { RecordTableBodySoftFocusClickOutsideEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodySoftFocusClickOutsideEffect';
import { RecordTableBodySoftFocusKeyboardEffect } from '@/object-record/record-table/record-table-body/components/RecordTableBodySoftFocusKeyboardEffect';
import { RecordTableNoRecordGroupBodyEffect } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBodyEffect';
import { RecordTableRecordGroupBodyEffects } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupBodyEffects';
import { isAtLeastOneTableRowSelectedSelector } from '@/object-record/record-table/record-table-row/states/isAtLeastOneTableRowSelectedSelector';
import { isSoftFocusActiveComponentState } from '@/object-record/record-table/states/isSoftFocusActiveComponentState';
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

  const isSoftFocusActiveState = useRecoilComponentValueV2(
    isSoftFocusActiveComponentState,
  );

  return (
    <>
      {hasRecordGroups ? (
        <RecordTableRecordGroupBodyEffects />
      ) : (
        <RecordTableNoRecordGroupBodyEffect />
      )}
      {isAtLeastOneRecordSelected && <RecordTableBodyEscapeHotkeyEffect />}
      {isSoftFocusActiveState && <RecordTableBodySoftFocusKeyboardEffect />}
      {isSoftFocusActiveState && (
        <RecordTableBodySoftFocusClickOutsideEffect
          tableBodyRef={tableBodyRef}
        />
      )}
    </>
  );
};

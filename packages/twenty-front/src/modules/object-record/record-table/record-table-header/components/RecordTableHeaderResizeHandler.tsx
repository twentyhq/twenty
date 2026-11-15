import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordColumnResizeHandle } from '@/object-record/record-index/components/RecordColumnResizeHandle';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { resizedRecordFieldIdComponentState } from '@/object-record/record-table/states/resizedRecordFieldIdComponentState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordTableHeaderResizeHandler = ({
  recordFieldIndex,
  position,
}: {
  recordFieldIndex: number;
  position: 'start' | 'end';
}) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const recordField: RecordField | undefined =
    position === 'start'
      ? visibleRecordFields[recordFieldIndex - 1]
      : visibleRecordFields[recordFieldIndex];

  const isMobile = useIsMobile();

  const columnResizeDisabled = isMobile;

  const [resizedRecordFieldId, setResizedRecordFieldId] = useAtomComponentState(
    resizedRecordFieldIdComponentState,
  );

  const isResizing = recordField?.id === resizedRecordFieldId;

  const { setDragSelectionStartEnabled } = useDragSelect();

  const handlePointerDown = () => {
    setDragSelectionStartEnabled(false);
    setResizedRecordFieldId(recordField?.id);
  };

  return (
    !columnResizeDisabled && (
      <RecordColumnResizeHandle
        isResizing={isResizing}
        position={position}
        onPointerDown={handlePointerDown}
      />
    )
  );
};

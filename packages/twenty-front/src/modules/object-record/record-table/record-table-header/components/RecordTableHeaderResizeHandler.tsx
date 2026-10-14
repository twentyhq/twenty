import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { RecordColumnResizeHandle } from '@/object-record/record-index/components/RecordColumnResizeHandle';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { resizedRecordFieldKeyComponentState } from '@/object-record/record-table/states/resizedRecordFieldKeyComponentState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordTableHeaderResizeHandler = ({
  recordFieldIndex,
  position,
}: {
  recordFieldIndex: number;
  position: 'left' | 'right';
}) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const recordField: RecordField | undefined =
    position === 'left'
      ? visibleRecordFields[recordFieldIndex - 1]
      : visibleRecordFields[recordFieldIndex];

  const isMobile = useIsMobile();

  const columnResizeDisabled = isMobile;

  const [resizedRecordFieldKey, setResizedRecordFieldKey] =
    useAtomComponentState(resizedRecordFieldKeyComponentState);

  const recordFieldKey = isDefined(recordField)
    ? getRecordFieldKey(recordField)
    : undefined;

  const isResizing = recordFieldKey === resizedRecordFieldKey;

  const { setDragSelectionStartEnabled } = useDragSelect();

  const handlePointerDown = () => {
    setDragSelectionStartEnabled(false);
    setResizedRecordFieldKey(recordFieldKey);
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

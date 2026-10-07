import { useLingui } from '@lingui/react';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordColumnResizeHandle } from '@/object-record/record-index/components/RecordColumnResizeHandle';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { getRecordTableResizeHandlePhysicalPosition } from '@/object-record/record-table/utils/getRecordTableResizeHandlePhysicalPosition';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { getLocaleTextDirection } from 'twenty-shared/translations';
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

  const { i18n } = useLingui();

  const physicalPosition = getRecordTableResizeHandlePhysicalPosition({
    position,
    textDirection: getLocaleTextDirection(i18n.locale),
  });

  const isMobile = useIsMobile();

  const columnResizeDisabled = isMobile;

  const [resizedFieldMetadataId, setResizedFieldMetadataId] =
    useAtomComponentState(resizedFieldMetadataIdComponentState);

  const isResizing =
    recordField?.fieldMetadataItemId === resizedFieldMetadataId;

  const { setDragSelectionStartEnabled } = useDragSelect();

  const handlePointerDown = () => {
    setDragSelectionStartEnabled(false);
    setResizedFieldMetadataId(recordField?.fieldMetadataItemId);
  };

  return (
    !columnResizeDisabled && (
      <RecordColumnResizeHandle
        isResizing={isResizing}
        position={physicalPosition}
        onPointerDown={handlePointerDown}
      />
    )
  );
};

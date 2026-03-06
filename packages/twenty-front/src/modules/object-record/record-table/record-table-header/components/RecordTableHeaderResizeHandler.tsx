import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledResizeHandler = styled.div<{
  isResizing: boolean;
  position: 'left' | 'right';
}>`
  bottom: 0;
  cursor: col-resize;
  left: ${({ position }) => (position === 'left' ? '-1px' : 'auto')};
  position: absolute;
  right: ${({ position }) => (position === 'right' ? '-1px' : 'auto')};
  top: 0;
  width: 10px;
  z-index: 1;

  &:after {
    background-color: ${themeCssVariables.color.blue};
    bottom: 0;
    content: '';
    display: ${({ isResizing }) => (isResizing ? 'block' : 'none')};
    left: ${({ position }) => (position === 'left' ? '-1px' : 'auto')};
    position: absolute;
    right: ${({ position }) => (position === 'right' ? '-1px' : 'auto')};
    top: 0;
    width: 2px;
  }
`;

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
      <StyledResizeHandler
        className="cursor-col-resize"
        role="separator"
        onPointerDown={handlePointerDown}
        isResizing={isResizing}
        position={position}
      />
    )
  );
};

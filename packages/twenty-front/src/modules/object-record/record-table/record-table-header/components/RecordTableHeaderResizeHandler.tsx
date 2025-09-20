import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledResizeHandler = styled.div<{
  isResizing: boolean;
  position: 'left' | 'right';
}>`
  bottom: 0;
  cursor: col-resize;
  position: absolute;
  ${({ position }) => (position === 'left' ? 'left: -1px;' : 'right: -1px;')}
  top: 0;
  width: 10px;
  z-index: 1;

  ${({ isResizing, theme, position }) => {
    if (isResizing === true) {
      return `&:after {
        background-color: ${theme.color.blue};
        bottom: 0;
        content: '';
        display: block;
        position: absolute;
        ${position === 'left' ? 'left: -1px;' : 'right: -1px;'}

        top: 0;
        width: 2px;
      }`;
    }
  }};
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

  const [resizedFieldMetadataItemId, setResizedFieldMetadataItemId] =
    useRecoilComponentState(resizedFieldMetadataIdComponentState);

  const isResizing =
    recordField?.fieldMetadataItemId === resizedFieldMetadataItemId;

  const { setDragSelectionStartEnabled } = useDragSelect();

  const handlePointerDown = () => {
    setDragSelectionStartEnabled(false);
    setResizedFieldMetadataItemId(recordField?.fieldMetadataItemId);
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

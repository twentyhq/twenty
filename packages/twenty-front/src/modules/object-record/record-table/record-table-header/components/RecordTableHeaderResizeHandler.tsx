import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledResizeHandler = styled.div<{ isResizing: boolean }>`
  bottom: 0;
  cursor: col-resize;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  position: absolute;
  right: -9px;
  top: 0;
  width: 3px;
  z-index: 1;

  ${({ isResizing, theme }) => {
    if (isResizing === true) {
      return `&:after {
        background-color: ${theme.color.blue};
        bottom: 0;
        content: '';
        display: block;
        position: absolute;
        right: 8px;
        top: 0;
        width: 2px;
      }`;
    }
  }};
`;

export const RecordTableHeaderResizeHandler = ({
  recordField,
}: {
  recordField: RecordField;
}) => {
  const isMobile = useIsMobile();

  const columnResizeDisabled = isMobile;

  const [resizedFieldMetadataItemId, setResizedFieldMetadataItemId] =
    useRecoilComponentState(resizedFieldMetadataIdComponentState);

  const isResizing =
    recordField.fieldMetadataItemId === resizedFieldMetadataItemId;

  const { setDragSelectionStartEnabled } = useDragSelect();

  const handlePointerDown = () => {
    setDragSelectionStartEnabled(false);
    setResizedFieldMetadataItemId(recordField.fieldMetadataItemId);
  };

  return (
    !columnResizeDisabled && (
      <StyledResizeHandler
        className="cursor-col-resize"
        role="separator"
        onPointerDown={handlePointerDown}
        isResizing={isResizing}
      />
    )
  );
};

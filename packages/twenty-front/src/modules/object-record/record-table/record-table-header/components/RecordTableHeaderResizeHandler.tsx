import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledResizeHandler = styled.div`
  bottom: 0;
  cursor: col-resize;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  position: absolute;
  right: -9px;
  top: 0;
  width: 3px;
  z-index: 1;
`;

export const RecordTableHeaderResizeHandler = ({
  recordField,
}: {
  recordField: RecordField;
}) => {
  const isMobile = useIsMobile();

  const columnResizeDisabled = isMobile;

  const setResizedFieldMetadataItemId = useSetRecoilComponentState(
    resizedFieldMetadataIdComponentState,
  );

  return (
    !columnResizeDisabled && (
      <StyledResizeHandler
        className="cursor-col-resize"
        role="separator"
        onPointerDown={() => {
          setResizedFieldMetadataItemId(recordField.fieldMetadataItemId);
        }}
      />
    )
  );
};

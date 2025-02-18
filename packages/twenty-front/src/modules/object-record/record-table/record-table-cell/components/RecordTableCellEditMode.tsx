import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { hasRecordTableCellDangerBorderScopedState } from '@/object-record/record-table/record-table-cell/states/hasRecordTableCellDangerBorderScopedState';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import styled from '@emotion/styled';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';
import { ReactElement, useContext } from 'react';
import { useRecoilValue } from 'recoil';

const StyledEditableCellEditModeContainer = styled.div<RecordTableCellEditModeProps>`
  align-items: center;
  display: flex;
  height: 100%;
  position: absolute;
  width: calc(100% + 2px);
  z-index: 6;
`;

export type RecordTableCellEditModeProps = {
  children: ReactElement;
  transparent?: boolean;
  maxContentWidth?: number;
  initialValue?: string;
};

export const RecordTableCellEditMode = ({
  children,
}: RecordTableCellEditModeProps) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const hasRecordTableCellDangerBorder = useRecoilValue(
    hasRecordTableCellDangerBorderScopedState(
      recordId + fieldDefinition.fieldMetadataId,
    ),
  );
  const { refs, floatingStyles } = useFloating({
    placement: 'top-start',
    middleware: [
      flip(),
      offset({
        mainAxis: -33,
        crossAxis: -3,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  return (
    <StyledEditableCellEditModeContainer
      ref={refs.setReference}
      data-testid="editable-cell-edit-mode-container"
    >
      <OverlayContainer
        ref={refs.setFloating}
        style={floatingStyles}
        borderRadius="sm"
        hasDangerBorder={hasRecordTableCellDangerBorder}
      >
        {children}
      </OverlayContainer>
    </StyledEditableCellEditModeContainer>
  );
};

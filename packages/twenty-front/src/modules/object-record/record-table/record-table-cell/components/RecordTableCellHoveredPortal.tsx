import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';

import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';
import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useContext } from 'react';
import { BORDER_COMMON } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledRecordTableCellHoveredPortalContent = styled.div<{
  isReadOnly: boolean;
  isRowActive: boolean;
  zIndex: number;
}>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.secondary};
  background-color: ${({ theme, isRowActive }) =>
    isRowActive ? theme.accent.quaternary : theme.background.primary};
  border-radius: ${({ isReadOnly }) =>
    !isReadOnly ? BORDER_COMMON.radius.sm : 'none'};
  box-sizing: border-box;
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
  display: flex;

  height: 32px;

  outline: ${({ theme, isReadOnly, isRowActive }) =>
    isRowActive
      ? 'none'
      : isReadOnly
        ? `1px solid ${theme.border.color.medium}`
        : `1px solid ${theme.font.color.extraLight}`};

  position: relative;
  user-select: none;

  z-index: ${({ zIndex }) => zIndex};
`;

const RecordTableCellHoveredPortalContent = () => {
  const hoverPosition = useRecoilComponentValue(
    recordTableHoverPositionComponentState,
  );

  const isMobile = useIsMobile();

  const isFirstColumn = hoverPosition?.column === 0;

  const { isRecordFieldReadOnly: isReadOnly } = useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly();

  const showButton =
    !isFieldInputOnly && !isReadOnly && !(isMobile && isFirstColumn);

  const { rowIndex } = useRecordTableRowContextOrThrow();

  const isRowActive = useRecoilComponentFamilyValue(
    isRecordTableRowActiveComponentFamilyState,
    rowIndex,
  );

  const isRecordTableScrolledHorizontally = useRecoilComponentValue(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const isRecordTableScrolledVertically = useRecoilComponentValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const computedZIndex =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.scrolledBothVerticallyAndHorizontally.hoverPortalCell
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.scrolledHorizontallyOnly.hoverPortalCell
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.scrolledVerticallyOnly.hoverPortalCell
          : TABLE_Z_INDEX.noScrollAtAll.hoverPortalCell;

  return (
    <StyledRecordTableCellHoveredPortalContent
      isReadOnly={isReadOnly}
      isRowActive={isRowActive}
      zIndex={computedZIndex}
    >
      {isFieldInputOnly ? (
        <RecordTableCellEditMode>
          <RecordTableCellFieldInput />
        </RecordTableCellEditMode>
      ) : (
        <RecordTableCellDisplayMode>
          <FieldDisplay />
        </RecordTableCellDisplayMode>
      )}
      {showButton && <RecordTableCellEditButton />}
    </StyledRecordTableCellHoveredPortalContent>
  );
};

const StyledRecordTableCellHoveredPortal = styled.div`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

export const RecordTableCellHoveredPortal = () => {
  const hoverPosition = useRecoilComponentValue(
    recordTableHoverPositionComponentState,
  );

  if (!hoverPosition) {
    return null;
  }

  return (
    <RecordTableCellPortalWrapper position={hoverPosition}>
      <StyledRecordTableCellHoveredPortal>
        <RecordTableCellHoveredPortalContent />
      </StyledRecordTableCellHoveredPortal>
    </RecordTableCellPortalWrapper>
  );
};

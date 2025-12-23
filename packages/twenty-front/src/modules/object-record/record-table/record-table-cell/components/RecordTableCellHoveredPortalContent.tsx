import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';

import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { BORDER_COMMON } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledRecordTableCellHoveredPortalContent = styled.div<{
  showInteractiveStyle: boolean;
  isRowActive: boolean;
}>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.secondary};
  background-color: ${({ theme, isRowActive }) =>
    isRowActive ? theme.accent.quaternary : theme.background.primary};
  border-radius: ${({ showInteractiveStyle }) =>
    showInteractiveStyle ? BORDER_COMMON.radius.sm : 'none'};
  box-sizing: border-box;
  cursor: ${({ showInteractiveStyle }) =>
    showInteractiveStyle ? 'pointer' : 'default'};
  display: flex;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  outline: ${({ theme, showInteractiveStyle, isRowActive }) =>
    isRowActive
      ? 'none'
      : showInteractiveStyle
        ? `1px solid ${theme.font.color.extraLight}`
        : `1px solid ${theme.border.color.medium}`};

  user-select: none;
`;

export const RecordTableCellHoveredPortalContent = () => {
  const hoverPosition = useRecoilComponentValue(
    recordTableHoverPositionComponentState,
  );

  const isMobile = useIsMobile();

  const isFirstColumn = hoverPosition?.column === 0;

  const { isRecordFieldReadOnly: isReadOnly } = useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly();

  const showButton =
    !isFieldInputOnly &&
    (!isReadOnly || isFirstColumn) &&
    !(isMobile && isFirstColumn);

  const showInteractiveStyle = !isReadOnly || (isFirstColumn && showButton);

  const { rowIndex } = useRecordTableRowContextOrThrow();

  const isRowActive = useRecoilComponentFamilyValue(
    isRecordTableRowActiveComponentFamilyState,
    rowIndex,
  );

  return (
    <StyledRecordTableCellHoveredPortalContent
      showInteractiveStyle={showInteractiveStyle}
      isRowActive={isRowActive}
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

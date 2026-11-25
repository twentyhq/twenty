import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusStaticFocusedProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellFieldDisplay } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldDisplay';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';
import { useRecordTableCellOutlinePortal } from '@/object-record/record-table/record-table-cell/hooks/useRecordTableCellOutlinePortal';
import { getRecordTableCellHoveredOutlineColor } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellHoveredOutlineColor';

import { isRecordTableRowActiveByRecordIdComponentFamilySelector } from '@/object-record/record-table/states/selectors/isRecordTableRowActiveByRecordIdComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledRecordTableCellHoveredPortalContent = styled.div<{
  showInteractiveStyle: boolean;
  isRecordTableRowActive: boolean;
  outlineColor: string;
  isTopEdgeCoveredByHeader: boolean;
}>`
  align-items: center;
  background: ${themeCssVariables.background.transparent.secondary};
  background-color: ${({ isRecordTableRowActive }) =>
    isRecordTableRowActive
      ? themeCssVariables.accent.quaternary
      : themeCssVariables.background.primary};
  border-radius: ${({ showInteractiveStyle }) =>
    showInteractiveStyle ? themeCssVariables.border.radius.sm : 'none'};
  box-shadow: ${({ isTopEdgeCoveredByHeader, outlineColor }) =>
    isTopEdgeCoveredByHeader ? `inset 0 1px 0 0 ${outlineColor}` : 'none'};
  box-sizing: border-box;
  cursor: ${({ showInteractiveStyle }) =>
    showInteractiveStyle ? 'pointer' : 'default'};
  display: flex;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  outline: 1px solid ${({ outlineColor }) => outlineColor};

  user-select: none;
`;

export const RecordTableCellHoveredPortalContent = () => {
  const recordTableHoverPosition = useAtomComponentStateValue(
    recordTableHoverPositionComponentState,
  );

  const isMobile = useIsMobile();

  const isFirstColumn = recordTableHoverPosition?.column === 0;

  const { isRecordFieldReadOnly: isReadOnly } = useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly() && !isReadOnly;

  const showButton =
    !isFieldInputOnly &&
    (!isReadOnly || isFirstColumn) &&
    !(isMobile && isFirstColumn);

  const showInteractiveStyle = !isReadOnly || (isFirstColumn && showButton);

  const { recordId } = useRecordTableRowContextOrThrow();

  const isRecordTableRowActive = useAtomComponentFamilySelectorValue(
    isRecordTableRowActiveByRecordIdComponentFamilySelector,
    recordId,
  );

  const { isTopEdgeCoveredByHeader } = useRecordTableCellOutlinePortal(
    recordTableHoverPosition,
  );

  const outlineColor = getRecordTableCellHoveredOutlineColor({
    isRecordTableRowActive,
    showInteractiveStyle,
  });

  return (
    <StyledRecordTableCellHoveredPortalContent
      showInteractiveStyle={showInteractiveStyle}
      isRecordTableRowActive={isRecordTableRowActive}
      outlineColor={outlineColor}
      isTopEdgeCoveredByHeader={isTopEdgeCoveredByHeader}
    >
      <FieldFocusStaticFocusedProvider>
        {isFieldInputOnly ? (
          <RecordTableCellEditMode>
            <RecordTableCellFieldInput />
          </RecordTableCellEditMode>
        ) : (
          <RecordTableCellDisplayMode>
            <RecordTableCellFieldDisplay />
          </RecordTableCellDisplayMode>
        )}
      </FieldFocusStaticFocusedProvider>
      {showButton && <RecordTableCellEditButton />}
    </StyledRecordTableCellHoveredPortalContent>
  );
};

import React, { ReactElement, useContext } from 'react';
import { styled } from '@linaria/react';
import { useRecoilValue } from 'recoil';
import { BORDER_COMMON, ThemeContext } from 'twenty-ui';

import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellSoftFocusMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellSoftFocusMode';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { isSoftFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isSoftFocusOnTableCellComponentFamilyState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { RecordTableCellDisplayMode } from './RecordTableCellDisplayMode';
import { RecordTableCellEditMode } from './RecordTableCellEditMode';

const StyledTd = styled.td<{
  isInEditMode: boolean;
  backgroundColor: string;
}>`
  background: ${({ backgroundColor }) => backgroundColor};
  z-index: ${({ isInEditMode }) => (isInEditMode ? '4 !important' : 3)};
`;

const borderRadiusSm = BORDER_COMMON.radius.sm;

const StyledBaseContainer = styled.div<{
  hasSoftFocus: boolean;
  fontColorExtraLight: string;
  backgroundColorTransparentSecondary: string;
}>`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;

  background: ${({ hasSoftFocus, backgroundColorTransparentSecondary }) =>
    hasSoftFocus ? backgroundColorTransparentSecondary : 'none'};

  border-radius: ${({ hasSoftFocus }) =>
    hasSoftFocus ? borderRadiusSm : 'none'};

  border: ${({ hasSoftFocus, fontColorExtraLight }) =>
    hasSoftFocus ? `1px solid ${fontColorExtraLight}` : 'none'};
`;

export type RecordTableCellContainerProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  editHotkeyScope?: HotkeyScope;
  transparent?: boolean;
  maxContentWidth?: number;
  onSubmit?: () => void;
  onCancel?: () => void;
};

const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export const RecordTableCellContainer = ({
  editModeContent,
  nonEditModeContent,
  editHotkeyScope,
}: RecordTableCellContainerProps) => {
  const { theme } = useContext(ThemeContext);

  const { setIsFocused } = useFieldFocus();
  const { openTableCell } = useOpenRecordTableCellFromCell();

  const { isSelected, recordId } = useContext(RecordTableRowContext);

  const { onMoveSoftFocusToCell, onContextMenu, onCellMouseEnter } =
    useContext(RecordTableContext);

  const tableScopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    getScopeIdOrUndefinedFromComponentId(),
  );

  const isTableCellInEditModeFamilyState = extractComponentFamilyState(
    isTableCellInEditModeComponentFamilyState,
    tableScopeId,
  );

  const isSoftFocusOnTableCellFamilyState = extractComponentFamilyState(
    isSoftFocusOnTableCellComponentFamilyState,
    tableScopeId,
  );

  const cellPosition = useCurrentTableCellPosition();

  const isInEditMode = useRecoilValue(
    isTableCellInEditModeFamilyState(cellPosition),
  );

  const hasSoftFocus = useRecoilValue(
    isSoftFocusOnTableCellFamilyState(cellPosition),
  );

  const handleContextMenu = (event: React.MouseEvent) => {
    onContextMenu(event, recordId);
  };

  const handleContainerMouseMove = () => {
    setIsFocused(true);
    if (!hasSoftFocus) {
      onCellMouseEnter({
        cellPosition,
      });
    }
  };

  const handleContainerMouseLeave = () => {
    setIsFocused(false);
  };

  const handleContainerClick = () => {
    if (!hasSoftFocus) {
      onMoveSoftFocusToCell(cellPosition);
      openTableCell();
    }
  };

  const tdBackgroundColor = isSelected
    ? theme.accent.quaternary
    : theme.background.primary;

  return (
    <StyledTd
      backgroundColor={tdBackgroundColor}
      isInEditMode={isInEditMode}
      onContextMenu={handleContextMenu}
    >
      <CellHotkeyScopeContext.Provider
        value={editHotkeyScope ?? DEFAULT_CELL_SCOPE}
      >
        <StyledBaseContainer
          onMouseLeave={handleContainerMouseLeave}
          onMouseMove={handleContainerMouseMove}
          onClick={handleContainerClick}
          backgroundColorTransparentSecondary={
            theme.background.transparent.secondary
          }
          fontColorExtraLight={theme.font.color.extraLight}
          hasSoftFocus={hasSoftFocus}
        >
          {isInEditMode ? (
            <RecordTableCellEditMode>{editModeContent}</RecordTableCellEditMode>
          ) : hasSoftFocus ? (
            <RecordTableCellSoftFocusMode
              editModeContent={editModeContent}
              nonEditModeContent={nonEditModeContent}
            />
          ) : (
            <RecordTableCellDisplayMode>
              {nonEditModeContent}
            </RecordTableCellDisplayMode>
          )}
        </StyledBaseContainer>
      </CellHotkeyScopeContext.Provider>
    </StyledTd>
  );
};

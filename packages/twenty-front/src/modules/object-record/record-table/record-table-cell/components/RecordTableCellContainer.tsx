import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconArrowUpRight } from 'twenty-ui';

import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { isSoftFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isSoftFocusOnTableCellComponentFamilyState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { ExpandableListProps } from '@/ui/layout/expandable-list/components/ExpandableList';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { RecordTableCellButton } from './RecordTableCellButton';
import { RecordTableCellDisplayMode } from './RecordTableCellDisplayMode';
import { RecordTableCellEditMode } from './RecordTableCellEditMode';
import { RecordTableCellSoftFocusMode } from './RecordTableCellSoftFocusMode';

const StyledTd = styled.td<{ isSelected: boolean; isInEditMode: boolean }>`
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.accent.quaternary : theme.background.primary};
  z-index: ${({ isInEditMode }) => (isInEditMode ? '4 !important' : '3')};
`;

const StyledCellBaseContainer = styled.div<{ softFocus: boolean }>`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;
  ${(props) =>
    props.softFocus
      ? `background: ${props.theme.background.transparent.secondary};
      border-radius: ${props.theme.border.radius.sm};
      outline: 1px solid ${props.theme.font.color.extraLight};`
      : ''}
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
  const { columnIndex } = useContext(RecordTableCellContext);
  const reference = useRef<HTMLTableCellElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [newNonEditModeContent, setNewNonEditModeContent] =
    useState<ReactElement>(nonEditModeContent);
  const { isReadOnly, isSelected, recordId } = useContext(
    RecordTableRowContext,
  );
  const { onMoveSoftFocusToCell, onContextMenu, onCellMouseEnter } =
    useContext(RecordTableContext);

  const cellPosition = useCurrentTableCellPosition();

  const { openTableCell } = useOpenRecordTableCellFromCell();

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

  const isCurrentTableCellInEditMode = useRecoilValue(
    isTableCellInEditModeFamilyState(cellPosition),
  );

  const hasSoftFocus = useRecoilValue(
    isSoftFocusOnTableCellFamilyState(cellPosition),
  );

  const isEmpty = useIsFieldEmpty();

  const handleButtonClick = () => {
    onMoveSoftFocusToCell(cellPosition);
    openTableCell();
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    onContextMenu(event, recordId);
  };

  const handleContainerMouseEnter = () => {
    onCellMouseEnter({
      cellPosition,
      isHovered,
      setIsHovered,
    });
  };

  const handleContainerMouseLeave = () => {
    setIsHovered(false);
  };

  const editModeContentOnly = useIsFieldInputOnly();

  const isFirstColumn = columnIndex === 0;
  const customButtonIcon = useGetButtonIcon();
  const buttonIcon = isFirstColumn ? IconArrowUpRight : customButtonIcon;

  const showButton =
    !!buttonIcon &&
    hasSoftFocus &&
    !isCurrentTableCellInEditMode &&
    !editModeContentOnly &&
    (!isFirstColumn || !isEmpty) &&
    !isReadOnly;

  useEffect(() => {
    if (React.isValidElement<ExpandableListProps>(nonEditModeContent)) {
      setNewNonEditModeContent(
        React.cloneElement(nonEditModeContent, {
          isHovered: showButton,
          reference: reference.current || undefined,
        }),
      );
    }
  }, [nonEditModeContent, showButton, reference]);

  return (
    <StyledTd
      ref={reference}
      isSelected={isSelected}
      onContextMenu={handleContextMenu}
      isInEditMode={isCurrentTableCellInEditMode}
    >
      <CellHotkeyScopeContext.Provider
        value={editHotkeyScope ?? DEFAULT_CELL_SCOPE}
      >
        <StyledCellBaseContainer
          onMouseEnter={handleContainerMouseEnter}
          onMouseLeave={handleContainerMouseLeave}
          softFocus={hasSoftFocus}
        >
          {isCurrentTableCellInEditMode ? (
            <RecordTableCellEditMode>{editModeContent}</RecordTableCellEditMode>
          ) : hasSoftFocus ? (
            <>
              <RecordTableCellSoftFocusMode>
                {editModeContentOnly ? editModeContent : newNonEditModeContent}
              </RecordTableCellSoftFocusMode>
              {showButton && (
                <RecordTableCellButton
                  onClick={handleButtonClick}
                  Icon={buttonIcon}
                />
              )}
            </>
          ) : (
            <>
              {!isEmpty && (
                <RecordTableCellDisplayMode>
                  {editModeContentOnly
                    ? editModeContent
                    : newNonEditModeContent}
                </RecordTableCellDisplayMode>
              )}
              {showButton && (
                <RecordTableCellButton
                  onClick={handleButtonClick}
                  Icon={buttonIcon}
                />
              )}
            </>
          )}
        </StyledCellBaseContainer>
      </CellHotkeyScopeContext.Provider>
    </StyledTd>
  );
};

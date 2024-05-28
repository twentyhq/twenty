import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { clsx } from 'clsx';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { RecordTableCellDisplayMode } from './RecordTableCellDisplayMode';
import { RecordTableCellEditMode } from './RecordTableCellEditMode';
import { RecordTableCellSoftFocusMode } from './RecordTableCellSoftFocusMode';

import styles from './RecordTableCellContainer.module.css';

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
  const { setIsFocused } = useFieldFocus();

  const { isSelected, recordId, isPendingRow } = useContext(
    RecordTableRowContext,
  );
  const { isLabelIdentifier } = useContext(FieldContext);
  const { onContextMenu, onCellMouseEnter } = useContext(RecordTableContext);

  const shouldBeInitiallyInEditMode =
    isPendingRow === true && isLabelIdentifier;

  const [isHovered, setIsHovered] = useState(false);
  const [hasSoftFocus, setHasSoftFocus] = useState(false);
  const [isInEditMode, setIsInEditMode] = useState(shouldBeInitiallyInEditMode);

  const cellPosition = useCurrentTableCellPosition();

  const handleContextMenu = (event: React.MouseEvent) => {
    onContextMenu(event, recordId);
  };

  const handleContainerMouseEnter = () => {
    if (!hasSoftFocus) {
      onCellMouseEnter({
        cellPosition,
        isHovered,
        setIsHovered,
      });
    }
  };

  const handleContainerMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    const customEventListener = (event: any) => {
      const newHasSoftFocus = event.detail;

      setHasSoftFocus(newHasSoftFocus);
      setIsFocused(newHasSoftFocus);
    };

    document.addEventListener(
      `soft-focus-move-${cellPosition.row}:${cellPosition.column}`,
      customEventListener,
    );

    return () => {
      document.removeEventListener(
        `soft-focus-move-${cellPosition.row}:${cellPosition.column}`,
        customEventListener,
      );
    };
  }, [cellPosition, setIsFocused]);

  useEffect(() => {
    const customEventListener = (event: any) => {
      const newIsInEditMode = event.detail;

      setIsInEditMode(newIsInEditMode);
    };

    document.addEventListener(
      `edit-mode-change-${cellPosition.row}:${cellPosition.column}`,
      customEventListener,
    );

    return () => {
      document.removeEventListener(
        `edit-mode-change-${cellPosition.row}:${cellPosition.column}`,
        customEventListener,
      );
    };
  }, [cellPosition]);

  return (
    <td
      className={clsx({
        [styles.tdInEditMode]: isInEditMode,
        [styles.tdNotInEditMode]: !isInEditMode,
        [styles.tdIsSelected]: isSelected,
        [styles.tdIsNotSelected]: !isSelected,
      })}
      onContextMenu={handleContextMenu}
    >
      <CellHotkeyScopeContext.Provider
        value={editHotkeyScope ?? DEFAULT_CELL_SCOPE}
      >
        <div
          onMouseEnter={handleContainerMouseEnter}
          onMouseLeave={handleContainerMouseLeave}
          onMouseMove={handleContainerMouseEnter}
          className={clsx({
            [styles.cellBaseContainer]: true,
            [styles.cellBaseContainerSoftFocus]: hasSoftFocus,
          })}
        >
          {isInEditMode ? (
            <RecordTableCellEditMode>{editModeContent}</RecordTableCellEditMode>
          ) : hasSoftFocus ? (
            <>
              <RecordTableCellSoftFocusMode
                editModeContent={editModeContent}
                nonEditModeContent={nonEditModeContent}
              />
            </>
          ) : (
            <RecordTableCellDisplayMode>
              {nonEditModeContent}
            </RecordTableCellDisplayMode>
          )}
        </div>
      </CellHotkeyScopeContext.Provider>
    </td>
  );
};

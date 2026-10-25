import { AdvancedTextEditorTableHandleMenu } from '@/advanced-text-editor/components/AdvancedTextEditorTableHandleMenu';
import { type HoveredTableCell } from '@/advanced-text-editor/types/HoveredTableCell';
import { runTableCellCommand } from '@/advanced-text-editor/utils/runTableCellCommand';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledExtendButton = styled.button`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.light};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0;
  position: absolute;
  z-index: 1;

  &:hover {
    background-color: ${themeCssVariables.background.transparent.medium};
  }
`;

const EXTEND_BUTTON_THICKNESS = themeCssVariables.spacing[4];

type AdvancedTextEditorTableHandlesProps = {
  editor: Editor;
  hoveredTableCell: HoveredTableCell;
  onMenuOpenChange: (isOpen: boolean) => void;
  onCellCommandRun: () => void;
};

export const AdvancedTextEditorTableHandles = ({
  editor,
  hoveredTableCell,
  onMenuOpenChange,
  onCellCommandRun,
}: AdvancedTextEditorTableHandlesProps) => {
  const { t } = useLingui();

  const handleAddRowAtEnd = () => {
    runTableCellCommand({
      editor,
      tablePosition: hoveredTableCell.tablePosition,
      rowIndex: hoveredTableCell.rowCount - 1,
      columnIndex: 0,
      command: (chain) => chain.addRowAfter(),
    });
    onCellCommandRun();
  };

  const handleAddColumnAtEnd = () => {
    runTableCellCommand({
      editor,
      tablePosition: hoveredTableCell.tablePosition,
      rowIndex: 0,
      columnIndex: hoveredTableCell.columnCount - 1,
      command: (chain) => chain.addColumnAfter(),
    });
    onCellCommandRun();
  };

  return (
    <>
      <AdvancedTextEditorTableHandleMenu
        editor={editor}
        hoveredTableCell={hoveredTableCell}
        orientation="row"
        onOpenChange={onMenuOpenChange}
      />
      <AdvancedTextEditorTableHandleMenu
        editor={editor}
        hoveredTableCell={hoveredTableCell}
        orientation="column"
        onOpenChange={onMenuOpenChange}
      />
      <StyledExtendButton
        type="button"
        data-table-handle
        aria-label={t`Add row`}
        style={{
          left: hoveredTableCell.tableLeft,
          top: hoveredTableCell.tableTop + hoveredTableCell.tableHeight,
          width: hoveredTableCell.tableWidth,
          height: EXTEND_BUTTON_THICKNESS,
        }}
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleAddRowAtEnd}
      >
        <IconPlus size={12} />
      </StyledExtendButton>
      <StyledExtendButton
        type="button"
        data-table-handle
        aria-label={t`Add column`}
        style={{
          left: hoveredTableCell.tableLeft + hoveredTableCell.tableWidth,
          top: hoveredTableCell.tableTop,
          width: EXTEND_BUTTON_THICKNESS,
          height: hoveredTableCell.tableHeight,
        }}
        onMouseDown={(event) => event.preventDefault()}
        onClick={handleAddColumnAtEnd}
      >
        <IconPlus size={12} />
      </StyledExtendButton>
    </>
  );
};

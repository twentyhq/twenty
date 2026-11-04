import { type HoveredTableCell } from '@/advanced-text-editor/types/HoveredTableCell';
import { runTableCellCommand } from '@/advanced-text-editor/utils/runTableCellCommand';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ChainedCommands, type Editor } from '@tiptap/core';
import { useId } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  type IconComponent,
  IconArrowMerge,
  IconArrowsSplit2,
  IconColumnInsertLeft,
  IconColumnInsertRight,
  IconGripHorizontal,
  IconGripVertical,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconTrash,
} from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledHandle = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 1;
`;

const StyledHandleButton = styled.button`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0;

  &:hover {
    background-color: ${themeCssVariables.background.tertiary};
  }
`;

const HANDLE_LENGTH = 24;
const HANDLE_THICKNESS = 14;

type TableHandleOrientation = 'row' | 'column';

type TableHandleAction = {
  label: string;
  icon: IconComponent;
  command: (chain: ChainedCommands) => ChainedCommands;
};

type AdvancedTextEditorTableHandleMenuProps = {
  editor: Editor;
  hoveredTableCell: HoveredTableCell;
  orientation: TableHandleOrientation;
  onOpenChange: (isOpen: boolean) => void;
};

export const AdvancedTextEditorTableHandleMenu = ({
  editor,
  hoveredTableCell,
  orientation,
  onOpenChange,
}: AdvancedTextEditorTableHandleMenuProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const instanceId = useId();

  const getHandleDisplay = () => {
    switch (orientation) {
      case 'row':
        return {
          ariaLabel: t`Open row menu`,
          HandleIcon: IconGripVertical,
          size: { width: HANDLE_THICKNESS, height: HANDLE_LENGTH },
          position: {
            left: hoveredTableCell.tableLeft,
            top: hoveredTableCell.rowTop + hoveredTableCell.rowHeight / 2,
          },
          insertActions: [
            {
              label: t`Add row above`,
              icon: IconRowInsertTop,
              command: (chain) => chain.addRowBefore(),
            },
            {
              label: t`Add row below`,
              icon: IconRowInsertBottom,
              command: (chain) => chain.addRowAfter(),
            },
          ] satisfies TableHandleAction[],
          deleteAction: {
            label: t`Delete row`,
            icon: IconTrash,
            command: (chain) => chain.deleteRow(),
          } satisfies TableHandleAction,
        };
      case 'column':
        return {
          ariaLabel: t`Open column menu`,
          HandleIcon: IconGripHorizontal,
          size: { width: HANDLE_LENGTH, height: HANDLE_THICKNESS },
          position: {
            left:
              hoveredTableCell.columnLeft + hoveredTableCell.columnWidth / 2,
            top: hoveredTableCell.tableTop,
          },
          insertActions: [
            {
              label: t`Add column left`,
              icon: IconColumnInsertLeft,
              command: (chain) => chain.addColumnBefore(),
            },
            {
              label: t`Add column right`,
              icon: IconColumnInsertRight,
              command: (chain) => chain.addColumnAfter(),
            },
          ] satisfies TableHandleAction[],
          deleteAction: {
            label: t`Delete column`,
            icon: IconTrash,
            command: (chain) => chain.deleteColumn(),
          } satisfies TableHandleAction,
        };
    }
  };

  const { ariaLabel, HandleIcon, size, position, insertActions, deleteAction } =
    getHandleDisplay();
  const canMergeCells = editor.can().mergeCells();
  const canSplitCell = editor.can().splitCell();

  const runOnHoveredCell = ({ command }: TableHandleAction) =>
    runTableCellCommand({
      editor,
      tablePosition: hoveredTableCell.tablePosition,
      rowIndex: hoveredTableCell.rowIndex,
      columnIndex: hoveredTableCell.columnIndex,
      command,
    });

  return (
    <StyledHandle data-table-handle style={position}>
      <DropdownRoot
        dropdownId={`advanced-text-editor-table-${orientation}-handle-${instanceId}`}
        type="menu"
        onOpenChange={onOpenChange}
      >
        <Dropdown.Trigger
          render={
            <StyledHandleButton
              type="button"
              aria-label={ariaLabel}
              style={size}
              onMouseDown={(event) => event.preventDefault()}
            >
              <HandleIcon
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.lg}
              />
            </StyledHandleButton>
          }
        />
        <DropdownContent
          side="bottom"
          align="start"
          width={GenericDropdownContentWidth.Medium}
        >
          <Dropdown.Section>
            {insertActions.map((action) => (
              <Dropdown.ActionItem
                key={action.label}
                startIcon={<action.icon />}
                onClick={() => runOnHoveredCell(action)}
              >
                {action.label}
              </Dropdown.ActionItem>
            ))}
          </Dropdown.Section>
          {(canMergeCells || canSplitCell) && (
            <>
              <Dropdown.Separator />
              <Dropdown.Section>
                {canMergeCells && (
                  <Dropdown.ActionItem
                    startIcon={<IconArrowMerge />}
                    onClick={() => editor.chain().focus().mergeCells().run()}
                  >
                    {t`Merge cells`}
                  </Dropdown.ActionItem>
                )}
                {canSplitCell && (
                  <Dropdown.ActionItem
                    startIcon={<IconArrowsSplit2 />}
                    onClick={() => editor.chain().focus().splitCell().run()}
                  >
                    {t`Split cell`}
                  </Dropdown.ActionItem>
                )}
              </Dropdown.Section>
            </>
          )}
          <Dropdown.Separator />
          <Dropdown.Section>
            <Dropdown.ActionItem
              color="danger"
              startIcon={<deleteAction.icon />}
              onClick={() => runOnHoveredCell(deleteAction)}
            >
              {deleteAction.label}
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
    </StyledHandle>
  );
};

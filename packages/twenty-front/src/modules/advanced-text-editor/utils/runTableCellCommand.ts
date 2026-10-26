import { type ChainedCommands, type Editor } from '@tiptap/core';
import { TableMap } from '@tiptap/pm/tables';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

type RunTableCellCommandArgs = {
  editor: Editor;
  tablePosition: number;
  rowIndex: number;
  columnIndex: number;
  command: (chain: ChainedCommands) => ChainedCommands;
};

export const runTableCellCommand = ({
  editor,
  tablePosition,
  rowIndex,
  columnIndex,
  command,
}: RunTableCellCommandArgs) => {
  const table = editor.state.doc.nodeAt(tablePosition);

  if (table?.type.name !== TIPTAP_NODE_TYPES.TABLE) {
    return;
  }

  const tableMap = TableMap.get(table);

  if (rowIndex >= tableMap.height || columnIndex >= tableMap.width) {
    return;
  }

  const cellPosition =
    tablePosition + 1 + tableMap.map[rowIndex * tableMap.width + columnIndex];

  command(
    editor.chain().focus().setCellSelection({ anchorCell: cellPosition }),
  ).run();
};

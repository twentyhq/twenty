import { TableMap } from '@tiptap/pm/tables';
import { type EditorView } from '@tiptap/pm/view';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { type HoveredTableCell } from '@/advanced-text-editor/types/HoveredTableCell';

type GetHoveredTableCellArgs = {
  view: EditorView;
  target: Element;
  container: HTMLElement;
};

export const getHoveredTableCell = ({
  view,
  target,
  container,
}: GetHoveredTableCellArgs): HoveredTableCell | null => {
  const cellElement = target.closest(doNotTranslate('td, th'));
  const rowElement = cellElement?.closest('tr');
  const tableElement = cellElement?.closest('table');

  if (
    !isDefined(cellElement) ||
    !isDefined(rowElement) ||
    !isDefined(tableElement) ||
    !view.dom.contains(cellElement)
  ) {
    return null;
  }

  const cellPosition = view.posAtDOM(cellElement, 0) - 1;
  const $cell = view.state.doc.resolve(cellPosition);

  if ($cell.depth < 2 || $cell.node(-1).type.name !== TIPTAP_NODE_TYPES.TABLE) {
    return null;
  }

  const table = $cell.node(-1);
  const tablePosition = $cell.before(-1);
  const tableMap = TableMap.get(table);
  const cellRect = tableMap.findCell(cellPosition - tablePosition - 1);

  const containerRect = container.getBoundingClientRect();
  const visibleRect = (
    tableElement.parentElement ?? tableElement
  ).getBoundingClientRect();
  const tableRect = tableElement.getBoundingClientRect();
  const rowRect = rowElement.getBoundingClientRect();
  const columnRect = cellElement.getBoundingClientRect();
  const tableLeft = Math.max(tableRect.left, visibleRect.left);
  const tableRight = Math.min(tableRect.right, visibleRect.right);

  return {
    tablePosition,
    rowIndex: cellRect.top,
    columnIndex: cellRect.left,
    rowCount: tableMap.height,
    columnCount: tableMap.width,
    rowTop: rowRect.top - containerRect.top,
    rowHeight: rowRect.height,
    columnLeft: columnRect.left - containerRect.left,
    columnWidth: columnRect.width,
    tableTop: tableRect.top - containerRect.top,
    tableLeft: tableLeft - containerRect.left,
    tableWidth: tableRight - tableLeft,
    tableHeight: tableRect.height,
  };
};

import { ADVANCED_TEXT_EDITOR_BLOCK_CONTAINER_NODE_TYPES } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockContainerNodeTypes';
import { type AdvancedTextEditorBlockContainer } from '@/advanced-text-editor/types/AdvancedTextEditorBlockContainer';
import { type AdvancedTextEditorChildBlock } from '@/advanced-text-editor/types/AdvancedTextEditorChildBlock';
import { getAdvancedTextEditorChildBlocks } from '@/advanced-text-editor/utils/getAdvancedTextEditorChildBlocks';
import { type Editor } from '@tiptap/core';
import { type EditorView } from '@tiptap/pm/view';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

const CONTAINER_EDGE_PX = 8;

type Point = {
  clientX: number;
  clientY: number;
};

const getVerticalDistance = (rect: DOMRect, clientY: number) =>
  Math.max(rect.top - clientY, clientY - rect.bottom, 0);

const getHorizontalDistance = (rect: DOMRect, clientX: number) =>
  Math.max(rect.left - clientX, clientX - rect.right, 0);

const findClosestBlock = (
  childBlocks: AdvancedTextEditorChildBlock[],
  getDistance: (childBlock: AdvancedTextEditorChildBlock) => number,
) =>
  childBlocks.reduce<AdvancedTextEditorChildBlock | undefined>(
    (closestBlock, childBlock) =>
      !isDefined(closestBlock) ||
      getDistance(childBlock) < getDistance(closestBlock)
        ? childBlock
        : closestBlock,
    undefined,
  );

const isInsideRow = (
  childBlocks: AdvancedTextEditorChildBlock[],
  arrayIndex: number,
  clientY: number,
) => {
  const { rect } = childBlocks[arrayIndex];
  const previousRect = childBlocks[arrayIndex - 1]?.rect;
  const nextRect = childBlocks[arrayIndex + 1]?.rect;
  const rowTop = isDefined(previousRect)
    ? (previousRect.bottom + rect.top) / 2
    : rect.top;
  const rowBottom = isDefined(nextRect)
    ? (rect.bottom + nextRect.top) / 2
    : rect.bottom;

  return clientY >= rowTop && clientY <= rowBottom;
};

const isPointDeepInside = (rect: DOMRect, point: Point) =>
  point.clientX >= rect.left + CONTAINER_EDGE_PX &&
  point.clientX <= rect.right - CONTAINER_EDGE_PX &&
  point.clientY >= rect.top + CONTAINER_EDGE_PX &&
  point.clientY <= rect.bottom - CONTAINER_EDGE_PX;

const pickHoveredChildBlock = (
  container: AdvancedTextEditorBlockContainer,
  childBlocks: AdvancedTextEditorChildBlock[],
  point: Point,
  isTopLevel: boolean,
) => {
  if (container.node.type.name === TIPTAP_NODE_TYPES.COLUMNS) {
    return findClosestBlock(childBlocks, ({ rect }) =>
      getHorizontalDistance(rect, point.clientX),
    );
  }

  if (isTopLevel) {
    return findClosestBlock(childBlocks, ({ rect }) =>
      getVerticalDistance(rect, point.clientY),
    );
  }

  return childBlocks.find((_, arrayIndex) =>
    isInsideRow(childBlocks, arrayIndex, point.clientY),
  );
};

const findHoveredBlock = (
  view: EditorView,
  container: AdvancedTextEditorBlockContainer,
  point: Point,
  isTopLevel: boolean,
): AdvancedTextEditorChildBlock | null => {
  const childBlocks = getAdvancedTextEditorChildBlocks(view, container);
  const hoveredBlock = pickHoveredChildBlock(
    container,
    childBlocks,
    point,
    isTopLevel,
  );

  if (!isDefined(hoveredBlock)) {
    return null;
  }

  const isContainer = ADVANCED_TEXT_EDITOR_BLOCK_CONTAINER_NODE_TYPES.includes(
    hoveredBlock.node.type.name,
  );

  const nestedBlock =
    isContainer && isPointDeepInside(hoveredBlock.rect, point)
      ? findHoveredBlock(
          view,
          {
            node: hoveredBlock.node,
            contentStart: hoveredBlock.pos + 1,
            element: hoveredBlock.element,
          },
          point,
          false,
        )
      : null;

  if (hoveredBlock.node.type.name === TIPTAP_NODE_TYPES.COLUMN) {
    return nestedBlock;
  }

  return nestedBlock ?? hoveredBlock;
};

type GetAdvancedTextEditorHoveredBlockArgs = {
  editor: Editor;
  clientX: number;
  clientY: number;
};

export const getAdvancedTextEditorHoveredBlock = ({
  editor,
  clientX,
  clientY,
}: GetAdvancedTextEditorHoveredBlockArgs) =>
  findHoveredBlock(
    editor.view,
    { node: editor.state.doc, contentStart: 0, element: editor.view.dom },
    { clientX, clientY },
    true,
  );

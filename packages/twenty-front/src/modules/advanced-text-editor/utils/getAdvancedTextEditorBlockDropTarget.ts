import { ADVANCED_TEXT_EDITOR_BLOCK_CONTAINER_NODE_TYPES } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockContainerNodeTypes';
import { type AdvancedTextEditorBlockContainer } from '@/advanced-text-editor/types/AdvancedTextEditorBlockContainer';
import { type AdvancedTextEditorBlockDropTarget } from '@/advanced-text-editor/types/AdvancedTextEditorBlockDropTarget';
import { type AdvancedTextEditorBlockRange } from '@/advanced-text-editor/types/AdvancedTextEditorBlockRange';
import { type AdvancedTextEditorChildBlock } from '@/advanced-text-editor/types/AdvancedTextEditorChildBlock';
import { getAdvancedTextEditorChildBlocks } from '@/advanced-text-editor/utils/getAdvancedTextEditorChildBlocks';
import { type Editor } from '@tiptap/core';
import { type NodeType } from '@tiptap/pm/model';
import { type EditorView } from '@tiptap/pm/view';
import { isDefined } from 'twenty-shared/utils';

const DROP_ZONE_MARGIN_PX = 40;
const CONTAINER_EDGE_PX = 8;
const INDICATOR_OFFSET_PX = 2;
const INDICATOR_THICKNESS_PX = 2;

type Point = {
  clientX: number;
  clientY: number;
};

const isPointInsideContainerChild = (
  childBlock: AdvancedTextEditorChildBlock,
  point: Point,
) =>
  ADVANCED_TEXT_EDITOR_BLOCK_CONTAINER_NODE_TYPES.includes(
    childBlock.node.type.name,
  ) &&
  point.clientX >= childBlock.rect.left &&
  point.clientX <= childBlock.rect.right &&
  point.clientY >= childBlock.rect.top + CONTAINER_EDGE_PX &&
  point.clientY <= childBlock.rect.bottom - CONTAINER_EDGE_PX;

const getIndicatorTop = (
  previousChild: AdvancedTextEditorChildBlock | undefined,
  nextChild: AdvancedTextEditorChildBlock | undefined,
) => {
  if (isDefined(previousChild) && isDefined(nextChild)) {
    return (previousChild.rect.bottom + nextChild.rect.top) / 2;
  }

  if (isDefined(nextChild)) {
    return nextChild.rect.top - INDICATOR_OFFSET_PX;
  }

  return isDefined(previousChild)
    ? previousChild.rect.bottom + INDICATOR_OFFSET_PX
    : 0;
};

const getContentBox = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const { paddingLeft, paddingRight } = getComputedStyle(element);
  const left = rect.left + (parseFloat(paddingLeft) || 0);
  const right = rect.right - (parseFloat(paddingRight) || 0);

  return { left, width: right - left };
};

const findDropTarget = (
  view: EditorView,
  container: AdvancedTextEditorBlockContainer,
  draggedNodeType: NodeType,
  sourceRange: AdvancedTextEditorBlockRange | null,
  point: Point,
): AdvancedTextEditorBlockDropTarget | null => {
  const childBlocks = getAdvancedTextEditorChildBlocks(view, container);

  if (childBlocks.length === 0) {
    return null;
  }

  const hoveredContainerChild = childBlocks.find(
    (childBlock) =>
      childBlock.pos !== sourceRange?.from &&
      isPointInsideContainerChild(childBlock, point),
  );

  if (isDefined(hoveredContainerChild)) {
    const nestedDropTarget = findDropTarget(
      view,
      {
        node: hoveredContainerChild.node,
        contentStart: hoveredContainerChild.pos + 1,
        element: hoveredContainerChild.element,
      },
      draggedNodeType,
      sourceRange,
      point,
    );

    if (isDefined(nestedDropTarget)) {
      return nestedDropTarget;
    }
  }

  const nextChildArrayIndex = childBlocks.findIndex(
    ({ rect }) => point.clientY < rect.top + rect.height / 2,
  );
  const insertionArrayIndex =
    nextChildArrayIndex === -1 ? childBlocks.length : nextChildArrayIndex;
  const previousChild = childBlocks[insertionArrayIndex - 1];
  const nextChild = childBlocks[insertionArrayIndex];
  const insertionIndex = nextChild?.index ?? container.node.childCount;

  if (
    !container.node.canReplaceWith(
      insertionIndex,
      insertionIndex,
      draggedNodeType,
    )
  ) {
    return null;
  }

  const insertionPos =
    nextChild?.pos ?? container.contentStart + container.node.content.size;
  const contentBox = getContentBox(container.element);

  return {
    from: insertionPos,
    to: insertionPos,
    indicatorTop:
      getIndicatorTop(previousChild, nextChild) - INDICATOR_THICKNESS_PX / 2,
    indicatorLeft: contentBox.left,
    indicatorWidth: contentBox.width,
    indicatorHeight: INDICATOR_THICKNESS_PX,
  };
};

type GetAdvancedTextEditorBlockDropTargetArgs = {
  editor: Editor;
  draggedNodeType: NodeType;
  sourceRange: AdvancedTextEditorBlockRange | null;
  clientX: number;
  clientY: number;
};

export const getAdvancedTextEditorBlockDropTarget = ({
  editor,
  draggedNodeType,
  sourceRange,
  clientX,
  clientY,
}: GetAdvancedTextEditorBlockDropTargetArgs): AdvancedTextEditorBlockDropTarget | null => {
  const { view } = editor;
  const editorRect = view.dom.getBoundingClientRect();

  const isInsideDropZone =
    clientX >= editorRect.left - DROP_ZONE_MARGIN_PX &&
    clientX <= editorRect.right + DROP_ZONE_MARGIN_PX &&
    clientY >= editorRect.top - DROP_ZONE_MARGIN_PX &&
    clientY <= editorRect.bottom + DROP_ZONE_MARGIN_PX;

  if (!isInsideDropZone) {
    return null;
  }

  const dropTarget = findDropTarget(
    view,
    { node: editor.state.doc, contentStart: 0, element: view.dom },
    draggedNodeType,
    sourceRange,
    { clientX, clientY },
  );

  if (!isDefined(dropTarget)) {
    return null;
  }

  if (
    isDefined(sourceRange) &&
    dropTarget.from >= sourceRange.from &&
    dropTarget.from <= sourceRange.to
  ) {
    return null;
  }

  if (!editor.isEmpty) {
    return dropTarget;
  }

  return { ...dropTarget, from: 0, to: editor.state.doc.content.size };
};

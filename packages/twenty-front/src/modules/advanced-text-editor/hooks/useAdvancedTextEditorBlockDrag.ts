import { type AdvancedTextEditorBlockDropTarget } from '@/advanced-text-editor/types/AdvancedTextEditorBlockDropTarget';
import { type AdvancedTextEditorBlockRange } from '@/advanced-text-editor/types/AdvancedTextEditorBlockRange';
import { type AdvancedTextEditorDraggedBlock } from '@/advanced-text-editor/types/AdvancedTextEditorDraggedBlock';
import { getAdvancedTextEditorBlockDropTarget } from '@/advanced-text-editor/utils/getAdvancedTextEditorBlockDropTarget';
import { getAdvancedTextEditorInlineDropTarget } from '@/advanced-text-editor/utils/getAdvancedTextEditorInlineDropTarget';
import { getScrollContainer } from '@/advanced-text-editor/utils/getScrollContainer';
import { insertAdvancedTextEditorBlock } from '@/advanced-text-editor/utils/insertAdvancedTextEditorBlock';
import { moveAdvancedTextEditorBlock } from '@/advanced-text-editor/utils/moveAdvancedTextEditorBlock';
import { type Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import {
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from 'react';
import { isDefined } from 'twenty-shared/utils';

const DRAG_START_DISTANCE_PX = 4;
const AUTO_SCROLL_EDGE_PX = 48;
const AUTO_SCROLL_MAX_STEP_PX = 14;
const DRAG_PREVIEW_CURSOR_OFFSET_PX = 14;

type Pointer = {
  clientX: number;
  clientY: number;
};

const isSameDropTarget = (
  firstDropTarget: AdvancedTextEditorBlockDropTarget | null,
  secondDropTarget: AdvancedTextEditorBlockDropTarget | null,
) =>
  firstDropTarget?.from === secondDropTarget?.from &&
  firstDropTarget?.to === secondDropTarget?.to &&
  firstDropTarget?.indicatorTop === secondDropTarget?.indicatorTop &&
  firstDropTarget?.indicatorLeft === secondDropTarget?.indicatorLeft &&
  firstDropTarget?.indicatorWidth === secondDropTarget?.indicatorWidth &&
  firstDropTarget?.indicatorHeight === secondDropTarget?.indicatorHeight;

const getAutoScrollStep = (scrollContainer: HTMLElement, pointer: Pointer) => {
  const rect = scrollContainer.getBoundingClientRect();

  if (pointer.clientX < rect.left || pointer.clientX > rect.right) {
    return 0;
  }

  const distanceToTop = Math.max(pointer.clientY - rect.top, 0);
  const distanceToBottom = Math.max(rect.bottom - pointer.clientY, 0);

  if (distanceToTop < AUTO_SCROLL_EDGE_PX) {
    return -AUTO_SCROLL_MAX_STEP_PX * (1 - distanceToTop / AUTO_SCROLL_EDGE_PX);
  }

  if (distanceToBottom < AUTO_SCROLL_EDGE_PX) {
    return (
      AUTO_SCROLL_MAX_STEP_PX * (1 - distanceToBottom / AUTO_SCROLL_EDGE_PX)
    );
  }

  return 0;
};

const paintDropIndicator = (
  dropIndicator: HTMLElement,
  dropTarget: AdvancedTextEditorBlockDropTarget | null,
) => {
  if (!isDefined(dropTarget)) {
    dropIndicator.dataset.visible = 'false';
    return;
  }

  const isAppearing = dropIndicator.dataset.visible !== 'true';

  if (isAppearing) {
    dropIndicator.style.transition = 'none';
  }

  dropIndicator.style.transform = `translate3d(${dropTarget.indicatorLeft}px, ${dropTarget.indicatorTop}px, 0)`;
  dropIndicator.style.width = `${dropTarget.indicatorWidth}px`;
  dropIndicator.style.height = `${dropTarget.indicatorHeight}px`;

  if (isAppearing) {
    dropIndicator.getBoundingClientRect();
    dropIndicator.style.removeProperty('transition');
  }

  dropIndicator.dataset.visible = 'true';
};

const paintDragPreview = (
  dragPreview: HTMLElement,
  pointer: Pointer,
  isDroppable: boolean,
) => {
  dragPreview.style.transform = `translate3d(${pointer.clientX + DRAG_PREVIEW_CURSOR_OFFSET_PX}px, ${pointer.clientY}px, 0)`;
  dragPreview.dataset.droppable = String(isDroppable);
  dragPreview.dataset.positioned = 'true';
};

const suppressNextClick = () => {
  const stopClick = (clickEvent: MouseEvent) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
  };

  window.addEventListener('click', stopClick, { capture: true, once: true });
  setTimeout(() => {
    window.removeEventListener('click', stopClick, { capture: true });
  }, 0);
};

type UseAdvancedTextEditorBlockDragArgs = {
  editor: Editor;
  onBlockDropped?: () => void;
};

export const useAdvancedTextEditorBlockDrag = ({
  editor,
  onBlockDropped,
}: UseAdvancedTextEditorBlockDragArgs) => {
  const [draggedBlock, setDraggedBlock] =
    useState<AdvancedTextEditorDraggedBlock | null>(null);
  const dropIndicatorRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);

  const dropBlock = (
    block: AdvancedTextEditorDraggedBlock,
    dropTarget: AdvancedTextEditorBlockDropTarget,
  ) => {
    if (isDefined(block.sourceRange)) {
      moveAdvancedTextEditorBlock(editor, block.sourceRange, dropTarget.from);
      return;
    }

    insertAdvancedTextEditorBlock(
      editor,
      { from: dropTarget.from, to: dropTarget.to },
      block.content,
    );
  };

  const fadeSourceBlock = (sourceRange: AdvancedTextEditorBlockRange) => {
    const pluginKey = new PluginKey('advancedTextEditorBlockDragSource');

    editor.registerPlugin(
      new Plugin({
        key: pluginKey,
        props: {
          decorations: (state) =>
            DecorationSet.create(state.doc, [
              Decoration.node(sourceRange.from, sourceRange.to, {
                class: 'block-drag-source',
              }),
            ]),
        },
      }),
    );

    return () => {
      if (!editor.isDestroyed) {
        editor.unregisterPlugin(pluginKey);
      }
    };
  };

  const startBlockDrag = (
    event: ReactPointerEvent<HTMLElement>,
    block: AdvancedTextEditorDraggedBlock,
  ) => {
    const draggedNodeType = isDefined(block.content.type)
      ? editor.schema.nodes[block.content.type]
      : undefined;

    if (
      event.button !== 0 ||
      !isDefined(draggedNodeType) ||
      !editor.isEditable
    ) {
      return;
    }

    event.preventDefault();

    const dragOrigin: Pointer = {
      clientX: event.clientX,
      clientY: event.clientY,
    };
    const pointer: Pointer = { ...dragOrigin };
    const scrollContainer = getScrollContainer(editor.view.dom);
    const listenersAbortController = new AbortController();
    let isDragging = false;
    let paintedDropTarget: AdvancedTextEditorBlockDropTarget | null = null;
    let animationFrameId: number | null = null;
    let restoreSourceBlock: (() => void) | null = null;

    const getDropTarget = () =>
      draggedNodeType.isInline
        ? getAdvancedTextEditorInlineDropTarget({
            editor,
            draggedNodeType,
            clientX: pointer.clientX,
            clientY: pointer.clientY,
          })
        : getAdvancedTextEditorBlockDropTarget({
            editor,
            draggedNodeType,
            sourceRange: block.sourceRange,
            clientX: pointer.clientX,
            clientY: pointer.clientY,
          });

    const stopDrag = () => {
      if (isDefined(animationFrameId)) {
        cancelAnimationFrame(animationFrameId);
      }

      restoreSourceBlock?.();
      restoreSourceBlock = null;

      listenersAbortController.abort();
      setDraggedBlock(null);
    };

    const renderFrame = () => {
      if (editor.isDestroyed) {
        stopDrag();
        return;
      }

      if (isDefined(scrollContainer)) {
        const autoScrollStep = getAutoScrollStep(scrollContainer, pointer);

        if (autoScrollStep !== 0) {
          scrollContainer.scrollTop += autoScrollStep;
        }
      }

      const dropTarget = getDropTarget();
      const dropIndicator = dropIndicatorRef.current;
      const dragPreview = dragPreviewRef.current;

      if (
        isDefined(dropIndicator) &&
        !isSameDropTarget(dropTarget, paintedDropTarget)
      ) {
        paintDropIndicator(dropIndicator, dropTarget);
        paintedDropTarget = dropTarget;
      }

      if (isDefined(dragPreview)) {
        paintDragPreview(dragPreview, pointer, isDefined(dropTarget));
      }

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      pointer.clientX = moveEvent.clientX;
      pointer.clientY = moveEvent.clientY;

      const distanceFromOrigin = Math.hypot(
        pointer.clientX - dragOrigin.clientX,
        pointer.clientY - dragOrigin.clientY,
      );

      if (isDragging || distanceFromOrigin < DRAG_START_DISTANCE_PX) {
        return;
      }

      isDragging = true;
      setDraggedBlock(block);

      if (isDefined(block.sourceRange)) {
        restoreSourceBlock = fadeSourceBlock(block.sourceRange);
      }

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      pointer.clientX = upEvent.clientX;
      pointer.clientY = upEvent.clientY;

      const dropTarget = isDragging ? getDropTarget() : null;
      const wasDragging = isDragging;

      stopDrag();

      if (!wasDragging) {
        return;
      }

      suppressNextClick();

      if (!isDefined(dropTarget) || editor.isDestroyed) {
        return;
      }

      dropBlock(block, dropTarget);
      onBlockDropped?.();
    };

    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== 'Escape') {
        return;
      }

      if (isDragging) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
      }

      stopDrag();
    };

    const { signal } = listenersAbortController;

    window.addEventListener('pointermove', handlePointerMove, { signal });
    window.addEventListener('pointerup', handlePointerUp, { signal });
    window.addEventListener('pointercancel', stopDrag, { signal });
    window.addEventListener('blur', stopDrag, { signal });
    window.addEventListener('keydown', handleKeyDown, {
      capture: true,
      signal,
    });
  };

  return {
    draggedBlock,
    dropIndicatorRef,
    dragPreviewRef,
    startBlockDrag,
  };
};

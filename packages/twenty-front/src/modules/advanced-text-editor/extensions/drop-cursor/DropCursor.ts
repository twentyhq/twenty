import { getDropCursorRect } from '@/advanced-text-editor/utils/getDropCursorRect';
import { getDropPosition } from '@/advanced-text-editor/utils/getDropPosition';
import { isBlockSlice } from '@/advanced-text-editor/utils/isBlockSlice';
import { Extension } from '@tiptap/core';
import {
  type EditorState,
  NodeSelection,
  Plugin,
  PluginKey,
  Selection,
} from '@tiptap/pm/state';
import { type EditorView } from '@tiptap/pm/view';
import { isDefined } from 'twenty-shared/utils';

const ABANDONED_DRAG_HIDE_DELAY_MS = 5000;

const createDropCursorView = (view: EditorView) => {
  const cursorElement = document.createElement('div');
  cursorElement.className = 'drop-cursor';

  let cursorPosition: number | null = null;
  let lastDragOverCoordinates: { left: number; top: number } | null = null;
  let hideTimeout: ReturnType<typeof setTimeout> | undefined;

  const hideCursor = () => {
    clearTimeout(hideTimeout);
    cursorPosition = null;
    lastDragOverCoordinates = null;
    cursorElement.remove();
  };

  const renderCursor = (position: number) => {
    const container = view.dom.offsetParent;

    if (!(container instanceof HTMLElement)) {
      return;
    }

    const cursorRect = getDropCursorRect({ view, position });
    const containerRect = container.getBoundingClientRect();

    cursorPosition = position;
    cursorElement.style.left = `${cursorRect.left - containerRect.left + container.scrollLeft}px`;
    cursorElement.style.top = `${cursorRect.top - containerRect.top + container.scrollTop}px`;
    cursorElement.style.width = `${cursorRect.width}px`;
    cursorElement.style.height = `${cursorRect.height}px`;

    if (cursorElement.parentElement !== container) {
      container.appendChild(cursorElement);
    }
  };

  const updateCursor = () => {
    if (!isDefined(lastDragOverCoordinates)) {
      return;
    }

    const position = getDropPosition({
      view,
      coordinates: lastDragOverCoordinates,
      slice: view.dragging?.slice,
    });

    if (isDefined(position)) {
      renderCursor(position);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    if (!view.editable) {
      return;
    }

    lastDragOverCoordinates = { left: event.clientX, top: event.clientY };
    updateCursor();
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideCursor, ABANDONED_DRAG_HIDE_DELAY_MS);
  };

  const handleDragLeave = (event: DragEvent) => {
    if (
      !(event.relatedTarget instanceof Node) ||
      !view.dom.contains(event.relatedTarget)
    ) {
      hideCursor();
    }
  };

  view.dom.addEventListener('dragover', handleDragOver);
  view.dom.addEventListener('dragleave', handleDragLeave);
  view.dom.addEventListener('drop', hideCursor);
  view.dom.addEventListener('dragend', hideCursor);

  return {
    update: (updatedView: EditorView, previousState: EditorState) => {
      if (
        isDefined(cursorPosition) &&
        !previousState.doc.eq(updatedView.state.doc)
      ) {
        updateCursor();
      }
    },
    destroy: () => {
      view.dom.removeEventListener('dragover', handleDragOver);
      view.dom.removeEventListener('dragleave', handleDragLeave);
      view.dom.removeEventListener('drop', hideCursor);
      view.dom.removeEventListener('dragend', hideCursor);
      hideCursor();
    },
  };
};

export const DropCursor = Extension.create({
  name: 'dropCursor',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('dropCursor'),
        view: createDropCursorView,
        props: {
          handleDrop: (view, event, slice, moved) => {
            if (!isDefined(view.dragging) || !isBlockSlice(slice)) {
              return false;
            }

            const position = getDropPosition({
              view,
              coordinates: { left: event.clientX, top: event.clientY },
              slice,
            });

            if (!isDefined(position)) {
              return false;
            }

            const transaction = view.state.tr;

            if (moved) {
              transaction.deleteSelection();
            }

            const insertPosition = transaction.mapping.map(position);
            const droppedNode =
              slice.content.childCount === 1 ? slice.content.firstChild : null;

            if (isDefined(droppedNode)) {
              transaction.replaceRangeWith(
                insertPosition,
                insertPosition,
                droppedNode,
              );
            } else {
              transaction.replaceRange(insertPosition, insertPosition, slice);
            }

            const $insertPosition = transaction.doc.resolve(insertPosition);
            const isDroppedNodeSelectable =
              isDefined(droppedNode) &&
              NodeSelection.isSelectable(droppedNode) &&
              ($insertPosition.nodeAfter?.sameMarkup(droppedNode) ?? false);

            transaction.setSelection(
              isDroppedNodeSelectable
                ? new NodeSelection($insertPosition)
                : Selection.near($insertPosition),
            );
            view.focus();
            view.dispatch(transaction.setMeta('uiEvent', 'drop'));

            return true;
          },
        },
      }),
    ];
  },
});

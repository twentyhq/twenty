import { ADVANCED_TEXT_EDITOR_EXTERNAL_DRAG_MIME_TYPE } from '@/advanced-text-editor/constants/AdvancedTextEditorExternalDragMimeType';
import { Extension, isNodeSelection } from '@tiptap/core';
import { Plugin, PluginKey, Selection } from '@tiptap/pm/state';

export const BlockDragAndDrop = Extension.create({
  name: 'blockDragAndDrop',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blockDragAndDrop'),
        appendTransaction: (transactions, _oldState, newState) => {
          const isDrop = transactions.some(
            (transaction) => transaction.getMeta('uiEvent') === 'drop',
          );

          if (!isDrop || !isNodeSelection(newState.selection)) {
            return null;
          }

          return newState.tr.setSelection(
            Selection.near(newState.doc.resolve(newState.selection.from + 1)),
          );
        },
        props: {
          dragCopies: (event) =>
            event.dataTransfer?.types.includes(
              ADVANCED_TEXT_EDITOR_EXTERNAL_DRAG_MIME_TYPE,
            ) ?? false,
        },
      }),
    ];
  },
});

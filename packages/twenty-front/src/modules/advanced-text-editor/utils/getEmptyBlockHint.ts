import { isNonEmptyString } from '@sniptt/guards';
import { type Editor } from '@tiptap/core';
import { type EditorState } from '@tiptap/pm/state';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export type EmptyBlockHintTarget = {
  from: number;
  to: number;
  kind: 'text' | 'heading' | 'listItem' | 'blockquote';
  headingLevel: number | null;
};

const hasCustomPlaceholder = (editor: Editor) =>
  isNonEmptyString(
    editor.extensionManager.extensions.find(
      (extension) => extension.name === 'placeholder',
    )?.options.placeholder,
  );

export const getEmptyBlockHint = (
  editor: Editor,
  state: EditorState = editor.state,
): EmptyBlockHintTarget | null => {
  const { selection, doc } = state;
  const { $from } = selection;
  const block = $from.parent;

  if (
    editor.isDestroyed ||
    !editor.isEditable ||
    !selection.empty ||
    !block.isTextblock ||
    block.content.size > 0
  ) {
    return null;
  }

  const isDocumentEmpty = doc.childCount === 1 && doc.firstChild === block;
  const isShownByCustomPlaceholder =
    block.type.name === TIPTAP_NODE_TYPES.PARAGRAPH &&
    hasCustomPlaceholder(editor);

  if (isDocumentEmpty ? isShownByCustomPlaceholder : !editor.isFocused) {
    return null;
  }

  const blockRange = { from: $from.before(), to: $from.after() };

  if (block.type.name === TIPTAP_NODE_TYPES.HEADING) {
    return { ...blockRange, kind: 'heading', headingLevel: block.attrs.level };
  }

  switch ($from.node(-1).type.name) {
    case TIPTAP_NODE_TYPES.LIST_ITEM:
      return { ...blockRange, kind: 'listItem', headingLevel: null };
    case TIPTAP_NODE_TYPES.BLOCKQUOTE:
      return { ...blockRange, kind: 'blockquote', headingLevel: null };
    default:
      return { ...blockRange, kind: 'text', headingLevel: null };
  }
};

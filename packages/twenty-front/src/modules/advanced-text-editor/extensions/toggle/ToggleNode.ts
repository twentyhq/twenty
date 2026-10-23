import { type Editor, mergeAttributes, Node } from '@tiptap/core';
import { type Level } from '@tiptap/extension-heading';
import {
  Plugin,
  PluginKey,
  TextSelection,
  type Transaction,
} from '@tiptap/pm/state';
import { isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  isDefined,
  RICH_TEXT_INDENTABLE_NODE_TYPES,
  TIPTAP_NODE_TYPES,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { createToggleNodeView } from '@/advanced-text-editor/extensions/toggle/createToggleNodeView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggle: {
      setToggle: (attributes?: { level?: Level }) => ReturnType;
    };
  }
}

const getToggleContext = (editor: Editor) => {
  const { $from, empty } = editor.state.selection;

  if (!empty || $from.depth < 2) {
    return undefined;
  }

  const toggleDepth = $from.depth - 1;
  const toggle = $from.node(toggleDepth);

  if (toggle.type.name !== TIPTAP_NODE_TYPES.TOGGLE) {
    return undefined;
  }

  return {
    $from,
    toggle,
    togglePosition: $from.before(toggleDepth),
    indexInToggle: $from.index(toggleDepth),
  };
};

const createParagraph = ({
  editor,
  indent,
}: {
  editor: Editor;
  indent?: number;
}) => editor.schema.nodes[TIPTAP_NODE_TYPES.PARAGRAPH].create({ indent });

const dispatchWithCursor = ({
  editor,
  transaction,
  position,
}: {
  editor: Editor;
  transaction: Transaction;
  position: number;
}) => {
  editor.view.dispatch(
    transaction
      .setSelection(TextSelection.create(transaction.doc, position))
      .scrollIntoView(),
  );

  return true;
};

const handleEnter = (editor: Editor) => {
  const context = getToggleContext(editor);

  if (!isDefined(context)) {
    return false;
  }

  const { $from, toggle, togglePosition, indexInToggle } = context;
  const toggleEnd = togglePosition + toggle.nodeSize;
  const indent = toggle.attrs.indent;

  if (indexInToggle > 0) {
    const isEmptyLastParagraph =
      indexInToggle === toggle.childCount - 1 &&
      $from.parent.type.name === TIPTAP_NODE_TYPES.PARAGRAPH &&
      $from.parent.content.size === 0;

    if (!isEmptyLastParagraph) {
      return false;
    }

    const transaction = editor.state.tr.delete($from.before(), $from.after());
    const insertPosition = transaction.mapping.map(toggleEnd);

    return dispatchWithCursor({
      editor,
      transaction: transaction.insert(
        insertPosition,
        createParagraph({ editor, indent }),
      ),
      position: insertPosition + 1,
    });
  }

  if ($from.parent.content.size === 0 && toggle.childCount === 1) {
    return dispatchWithCursor({
      editor,
      transaction: editor.state.tr.replaceWith(
        togglePosition,
        toggleEnd,
        createParagraph({ editor, indent }),
      ),
      position: togglePosition + 1,
    });
  }

  const toggleElement = editor.view.nodeDOM(togglePosition);
  const isOpen =
    toggleElement instanceof HTMLElement &&
    toggleElement.dataset.open === 'true';

  if (
    $from.parentOffset === $from.parent.content.size &&
    toggle.childCount > 1 &&
    isOpen
  ) {
    const insertPosition = $from.after();

    return dispatchWithCursor({
      editor,
      transaction: editor.state.tr.insert(
        insertPosition,
        createParagraph({ editor }),
      ),
      position: insertPosition + 1,
    });
  }

  const isHeadingSummary = $from.parent.type.name === TIPTAP_NODE_TYPES.HEADING;
  const textAfterCursor = $from.parent.content.cut($from.parentOffset);
  const paragraphType = editor.schema.nodes[TIPTAP_NODE_TYPES.PARAGRAPH];
  const sibling = isHeadingSummary
    ? paragraphType.create({ indent }, textAfterCursor)
    : toggle.type.create(
        { indent },
        paragraphType.create(null, textAfterCursor),
      );
  const transaction = editor.state.tr.delete($from.pos, $from.end());
  const insertPosition = transaction.mapping.map(toggleEnd);

  return dispatchWithCursor({
    editor,
    transaction: transaction.insert(insertPosition, sibling),
    position: insertPosition + (isHeadingSummary ? 1 : 2),
  });
};

const handleBackspace = (editor: Editor) => {
  const context = getToggleContext(editor);

  if (
    !isDefined(context) ||
    context.indexInToggle !== 0 ||
    context.$from.parentOffset !== 0
  ) {
    return false;
  }

  const { toggle, togglePosition } = context;
  const indent = Number(toggle.attrs.indent ?? 0);
  const unwrappedNodes = toggle.children.map((child, index) =>
    RICH_TEXT_INDENTABLE_NODE_TYPES.includes(child.type.name)
      ? child.type.create(
          { ...child.attrs, indent: index === 0 ? indent : indent + 1 },
          child.content,
          child.marks,
        )
      : child,
  );

  return dispatchWithCursor({
    editor,
    transaction: editor.state.tr.replaceWith(
      togglePosition,
      togglePosition + toggle.nodeSize,
      unwrappedNodes,
    ),
    position: togglePosition + 1,
  });
};

export const ToggleNode = Node.create({
  name: TIPTAP_NODE_TYPES.TOGGLE,
  group: 'block',
  content: doNotTranslate('(paragraph | heading) block*'),
  defining: true,

  addAttributes: () => ({
    id: {
      default: null,
      keepOnSplit: false,
      parseHTML: (element) => element.getAttribute('data-toggle-id'),
      renderHTML: (attributes) => ({ 'data-toggle-id': attributes.id }),
    },
  }),

  parseHTML: () => [{ tag: 'div[data-type="toggle"]' }],

  renderHTML: ({ HTMLAttributes }) => [
    'div',
    mergeAttributes(HTMLAttributes, { 'data-type': TIPTAP_NODE_TYPES.TOGGLE }),
    0,
  ],

  addNodeView: () => createToggleNodeView,

  addCommands: () => ({
    setToggle:
      ({ level } = {}) =>
      ({ state, tr: transaction, dispatch }) => {
        const { selection, schema } = state;
        const { $from } = selection;
        const textBlock = $from.parent;

        if (!textBlock.isTextblock || textBlock.type.spec.code) {
          return false;
        }

        const summary = isDefined(level)
          ? schema.nodes[TIPTAP_NODE_TYPES.HEADING].create(
              { level },
              textBlock.content,
            )
          : schema.nodes[TIPTAP_NODE_TYPES.PARAGRAPH].create(
              null,
              textBlock.content,
            );
        const toggle = schema.nodes[TIPTAP_NODE_TYPES.TOGGLE].create(
          { indent: textBlock.attrs.indent },
          summary,
        );
        const blockIndex = $from.index(-1);

        if (
          !$from
            .node(-1)
            .canReplaceWith(blockIndex, blockIndex + 1, toggle.type)
        ) {
          return false;
        }

        if (isDefined(dispatch)) {
          const blockPosition = $from.before();

          transaction
            .replaceWith(blockPosition, $from.after(), toggle)
            .setSelection(
              TextSelection.create(
                transaction.doc,
                blockPosition + 2 + $from.parentOffset,
              ),
            );
        }

        return true;
      },
  }),

  addKeyboardShortcuts() {
    return {
      Enter: () => handleEnter(this.editor),
      Backspace: () => handleBackspace(this.editor),
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('toggleIds'),
        appendTransaction: (appliedTransactions, _oldState, newState) => {
          if (
            !appliedTransactions.some(
              (appliedTransaction) => appliedTransaction.docChanged,
            )
          ) {
            return null;
          }

          const seenIds = new Set<string>();
          const transaction = newState.tr;

          newState.doc.descendants((node, position) => {
            if (node.type.name !== TIPTAP_NODE_TYPES.TOGGLE) {
              return;
            }

            if (
              isNonEmptyString(node.attrs.id) &&
              !seenIds.has(node.attrs.id)
            ) {
              seenIds.add(node.attrs.id);

              return;
            }

            transaction.setNodeAttribute(position, 'id', v4());
          });

          return transaction.docChanged
            ? transaction.setMeta('addToHistory', false)
            : null;
        },
      }),
    ];
  },
});

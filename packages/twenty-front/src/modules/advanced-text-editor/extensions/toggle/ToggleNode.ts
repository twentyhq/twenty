import { type Editor, mergeAttributes, Node } from '@tiptap/core';
import { type Level } from '@tiptap/extension-heading';
import {
  Fragment,
  type Node as ProseMirrorNode,
  type ResolvedPos,
} from '@tiptap/pm/model';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { isNonEmptyString } from '@sniptt/guards';
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

const withIndent = (node: ProseMirrorNode, indent: number) =>
  RICH_TEXT_INDENTABLE_NODE_TYPES.includes(node.type.name)
    ? node.type.create({ ...node.attrs, indent }, node.content, node.marks)
    : node;

const isToggleOpen = (editor: Editor, togglePosition: number) => {
  const toggleElement = editor.view.nodeDOM(togglePosition);

  return (
    toggleElement instanceof HTMLElement &&
    toggleElement.dataset.open === 'true'
  );
};

const splitSummary = (
  editor: Editor,
  {
    $from,
    toggle,
    togglePosition,
  }: { $from: ResolvedPos; toggle: ProseMirrorNode; togglePosition: number },
) => {
  const { schema } = editor.state;
  const paragraph = schema.nodes[TIPTAP_NODE_TYPES.PARAGRAPH].create(
    { indent: toggle.attrs.indent },
    $from.parent.content.cut($from.parentOffset),
  );
  const sibling =
    $from.parent.type.name === TIPTAP_NODE_TYPES.HEADING
      ? paragraph
      : toggle.type.create(
          { indent: toggle.attrs.indent },
          paragraph.type.create(null, paragraph.content),
        );
  const tr = editor.state.tr.delete($from.pos, $from.end());
  const insertPosition = tr.mapping.map(togglePosition + toggle.nodeSize);

  tr.insert(insertPosition, sibling);
  tr.setSelection(
    TextSelection.create(
      tr.doc,
      insertPosition + (sibling.type === toggle.type ? 2 : 1),
    ),
  );
  editor.view.dispatch(tr.scrollIntoView());

  return true;
};

const handleEnter = (editor: Editor) => {
  const context = getToggleContext(editor);

  if (!isDefined(context)) {
    return false;
  }

  const { $from, toggle, togglePosition, indexInToggle } = context;
  const { schema } = editor.state;

  if (indexInToggle > 0) {
    const isEmptyLastParagraph =
      indexInToggle === toggle.childCount - 1 &&
      $from.parent.type.name === TIPTAP_NODE_TYPES.PARAGRAPH &&
      $from.parent.content.size === 0;

    if (!isEmptyLastParagraph) {
      return false;
    }

    const tr = editor.state.tr.delete($from.before(), $from.after());
    const insertPosition = tr.mapping.map(togglePosition + toggle.nodeSize);

    tr.insert(
      insertPosition,
      schema.nodes[TIPTAP_NODE_TYPES.PARAGRAPH].create({
        indent: toggle.attrs.indent,
      }),
    );
    tr.setSelection(TextSelection.create(tr.doc, insertPosition + 1));
    editor.view.dispatch(tr.scrollIntoView());

    return true;
  }

  if ($from.parent.content.size === 0 && toggle.childCount === 1) {
    const tr = editor.state.tr.replaceWith(
      togglePosition,
      togglePosition + toggle.nodeSize,
      schema.nodes[TIPTAP_NODE_TYPES.PARAGRAPH].create({
        indent: toggle.attrs.indent,
      }),
    );

    tr.setSelection(TextSelection.create(tr.doc, togglePosition + 1));
    editor.view.dispatch(tr);

    return true;
  }

  const isCursorAtSummaryEnd = $from.parentOffset === $from.parent.content.size;

  if (
    isCursorAtSummaryEnd &&
    toggle.childCount > 1 &&
    isToggleOpen(editor, togglePosition)
  ) {
    const insertPosition = $from.after();
    const tr = editor.state.tr.insert(
      insertPosition,
      schema.nodes[TIPTAP_NODE_TYPES.PARAGRAPH].create(),
    );

    tr.setSelection(TextSelection.create(tr.doc, insertPosition + 1));
    editor.view.dispatch(tr.scrollIntoView());

    return true;
  }

  return splitSummary(editor, context);
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
  const unwrappedNodes: ProseMirrorNode[] = [];

  toggle.forEach((child, _offset, index) =>
    unwrappedNodes.push(withIndent(child, index === 0 ? indent : indent + 1)),
  );

  const tr = editor.state.tr.replaceWith(
    togglePosition,
    togglePosition + toggle.nodeSize,
    Fragment.from(unwrappedNodes),
  );

  tr.setSelection(TextSelection.create(tr.doc, togglePosition + 1));
  editor.view.dispatch(tr);

  return true;
};

export const ToggleNode = Node.create({
  name: TIPTAP_NODE_TYPES.TOGGLE,
  group: 'block',
  content: '(paragraph | heading) block*',
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
      ({ state, tr, dispatch }) => {
        const { $from } = state.selection;
        const textBlock = $from.parent;

        if (!textBlock.isTextblock || textBlock.type.spec.code === true) {
          return false;
        }

        const { schema } = state;
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

          tr.replaceWith(blockPosition, $from.after(), toggle);
          tr.setSelection(
            TextSelection.create(
              tr.doc,
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
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((transaction) => transaction.docChanged)) {
            return null;
          }

          const seenIds = new Set<string>();
          const tr = newState.tr;

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

            tr.setNodeAttribute(position, 'id', v4());
          });

          return tr.docChanged ? tr.setMeta('addToHistory', false) : null;
        },
      }),
    ];
  },
});

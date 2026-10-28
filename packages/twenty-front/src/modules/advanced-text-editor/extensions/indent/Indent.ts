import { type Editor, Extension } from '@tiptap/core';
import { type ResolvedPos } from '@tiptap/pm/model';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  isDefined,
  RICH_TEXT_INDENTABLE_NODE_TYPES,
  RICH_TEXT_MAX_INDENT_LEVEL,
  TIPTAP_NODE_TYPES,
} from 'twenty-shared/utils';

const INDENT_CONTAINER_NODE_TYPES: string[] = [
  TIPTAP_NODE_TYPES.DOCUMENT,
  TIPTAP_NODE_TYPES.TOGGLE,
];

const NESTING_NODE_TYPES: string[] = [
  TIPTAP_NODE_TYPES.LIST_ITEM,
  TIPTAP_NODE_TYPES.TASK_ITEM,
  TIPTAP_NODE_TYPES.TABLE_CELL,
  TIPTAP_NODE_TYPES.TABLE_HEADER,
];

const clampIndent = (indent: number) =>
  Math.min(Math.max(Math.trunc(indent), 0), RICH_TEXT_MAX_INDENT_LEVEL);

const findIndentedBlockDepth = ($from: ResolvedPos): number | undefined => {
  for (let depth = $from.depth; depth > 0; depth--) {
    if (NESTING_NODE_TYPES.includes($from.node(depth).type.name)) {
      return undefined;
    }

    const container = $from.node(depth - 1);

    if (
      !INDENT_CONTAINER_NODE_TYPES.includes(container.type.name) ||
      (container.type.name === TIPTAP_NODE_TYPES.TOGGLE &&
        $from.index(depth - 1) === 0)
    ) {
      continue;
    }

    return RICH_TEXT_INDENTABLE_NODE_TYPES.includes($from.node(depth).type.name)
      ? depth
      : undefined;
  }

  return undefined;
};

const changeIndent = ({ editor, delta }: { editor: Editor; delta: number }) => {
  const { $from } = editor.state.selection;
  const depth = findIndentedBlockDepth($from);

  if (!isDefined(depth)) {
    return false;
  }

  const block = $from.node(depth);
  const indent = clampIndent(block.attrs.indent + delta);

  if (indent !== block.attrs.indent) {
    editor.view.dispatch(
      editor.state.tr.setNodeAttribute($from.before(depth), 'indent', indent),
    );
  }

  return true;
};

export const Indent = Extension.create({
  name: 'indent',
  priority: 101,

  addGlobalAttributes: () => [
    {
      types: RICH_TEXT_INDENTABLE_NODE_TYPES,
      attributes: {
        indent: {
          default: 0,
          parseHTML: (element) =>
            clampIndent(Number(element.getAttribute('data-indent')) || 0),
          renderHTML: (attributes) => {
            const indent = clampIndent(Number(attributes.indent) || 0);

            return indent > 0
              ? {
                  'data-indent': indent,
                  style: doNotTranslate(
                    `margin-left: calc(${indent} * var(--editor-list-indent))`,
                  ),
                }
              : {};
          },
        },
      },
    },
  ],

  addKeyboardShortcuts() {
    return {
      Tab: () => changeIndent({ editor: this.editor, delta: 1 }),
      'Shift-Tab': () => changeIndent({ editor: this.editor, delta: -1 }),
      Backspace: () => {
        const { $from, empty } = this.editor.state.selection;

        return (
          empty &&
          $from.parentOffset === 0 &&
          $from.parent.attrs.indent > 0 &&
          findIndentedBlockDepth($from) === $from.depth &&
          changeIndent({ editor: this.editor, delta: -1 })
        );
      },
    };
  },
});

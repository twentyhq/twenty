import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockquote: {
      toggleBlockquote: () => ReturnType;
    };
  }
}

export const Blockquote = Node.create({
  name: TIPTAP_NODE_TYPES.BLOCKQUOTE,
  group: 'block',
  content: 'paragraph+',
  defining: true,

  parseHTML() {
    return [{ tag: 'blockquote' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['blockquote', mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      toggleBlockquote:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
    };
  },

  addInputRules() {
    return [wrappingInputRule({ find: /^\s*>\s$/, type: this.type })];
  },
});

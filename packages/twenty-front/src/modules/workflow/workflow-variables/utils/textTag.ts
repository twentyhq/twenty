import { WorkflowTextEditorTextChip } from '@/workflow/workflow-variables/components/WorkflowTextEditorTextChip';
import { Node } from '@tiptap/core';
import { mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textTag: {
      insertTextTag: (text: string) => ReturnType;
    };
  }
}

export const TextTag = Node.create({
  name: 'textTag',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes: () => ({
    text: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-text'),
      renderHTML: (attributes) => {
        return {
          'data-text': attributes.text,
        };
      },
    },
  }),

  renderHTML: ({ node, HTMLAttributes }) => {
    const text = node.attrs.text as string;

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'textTag',
        class: 'text-tag',
      }),
      text,
    ];
  },

  addNodeView: () => {
    return ReactNodeViewRenderer(WorkflowTextEditorTextChip);
  },

  renderText: ({ node }) => {
    return node.attrs.text;
  },

  addCommands: () => ({
    insertTextTag:
      (text: string) =>
      ({ commands }) => {
        commands.insertContent({
          type: 'textTag',
          attrs: { text },
        });

        return true;
      },
  }),
});

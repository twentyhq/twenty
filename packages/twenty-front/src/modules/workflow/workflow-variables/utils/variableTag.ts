import { extractVariableLabel } from '@/workflow/workflow-variables/utils/extractVariableLabel';
import { Node } from '@tiptap/core';
import { mergeAttributes } from '@tiptap/react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variableTag: {
      insertVariableTag: (variableName: string) => ReturnType;
    };
  }
}

export const VariableTag = Node.create({
  name: 'variableTag',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes: () => ({
    variable: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-variable'),
      renderHTML: (attributes) => {
        return {
          'data-variable': attributes.variable,
        };
      },
    },
  }),

  renderHTML: ({ node, HTMLAttributes }) => {
    const variable = node.attrs.variable as string;

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'variableTag',
        class: 'variable-tag',
      }),
      extractVariableLabel(variable),
    ];
  },

  renderText: ({ node }) => {
    return node.attrs.variable;
  },

  addCommands: () => ({
    insertVariableTag:
      (variableName: string) =>
      ({ commands }) => {
        commands.insertContent({
          type: 'variableTag',
          attrs: { variable: variableName },
        });

        return true;
      },
  }),
});

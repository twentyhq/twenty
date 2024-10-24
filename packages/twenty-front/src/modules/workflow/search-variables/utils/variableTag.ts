import { Node } from '@tiptap/core';
import { mergeAttributes } from '@tiptap/react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variableTag: {
      insertVariableTag: (variable: string) => ReturnType;
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
    const variableWithoutBrackets = variable.replace(
      /\{\{([^}]+)\}\}/g,
      (_, variable) => {
        return variable;
      },
    );

    const parts = variableWithoutBrackets.split('.');
    const displayText = parts[parts.length - 1];

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'variableTag',
        class: 'variable-tag',
      }),
      displayText,
    ];
  },

  addCommands: () => ({
    insertVariableTag:
      (variable: string) =>
      ({ commands }) => {
        commands.insertContent?.({
          type: 'variableTag',
          attrs: { variable },
        });

        return true;
      },
  }),
});

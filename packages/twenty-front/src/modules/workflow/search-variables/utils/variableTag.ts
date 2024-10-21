import { Node } from '@tiptap/core';
import { mergeAttributes, RawCommands } from '@tiptap/react';

export const VariableTag = Node.create({
  name: 'variableTag',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes: () => ({
    variable: {
      default: null,
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

  // @ts-expect-error - addCommands is missing from the NodeConfig type
  addCommands: () => ({
    insertVariableTag:
      (variable: string) =>
      ({ commands }: { commands: Partial<RawCommands> }) => {
        return commands.insertContent?.({
          type: 'variableTag',
          attrs: { variable },
        });
      },
  }),
});

import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'max-consts-per-file';

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure there are at most a specified number of const declarations constant file',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          max: { type: 'integer', minimum: 0 },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyConstants:
        'Only a maximum of ({{ max }}) const declarations are allowed in this file.',
    },
  },
  create: (context) => {
    const [{ max }] = context.options as [{ max: number }];
    let constCount = 0;
    return {
      VariableDeclaration: (node: any) => {
        constCount++;
        if (constCount > max) {
          context.report({
            node,
            messageId: 'tooManyConstants',
            data: { max },
          });
        }
      },
    };
  },
});

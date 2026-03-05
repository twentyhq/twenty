import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'styled-components-prefixed-with-styled';

export const rule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Warn when StyledComponents are not prefixed with Styled',
    },
    messages: {
      noStyledPrefix:
        '{{componentName}} is a StyledComponent and is not prefixed with Styled.',
    },
    fixable: 'code',
    schema: [],
  },
  create: (context) => {
    return {
      VariableDeclarator: (node: any) => {
        const templateExpr = node.init;
        if (templateExpr?.type !== 'TaggedTemplateExpression') return;
        const tag = templateExpr.tag;
        const tagged =
          tag.type === 'MemberExpression'
            ? tag.object
            : tag.type === 'CallExpression'
              ? tag.callee
              : null;

        if (
          node.id?.type === 'Identifier' &&
          tagged?.type === 'Identifier' &&
          tagged.name === 'styled'
        ) {
          const variable = node.id;
          if (variable.name.startsWith('Styled')) return;

          context.report({
            node,
            messageId: 'noStyledPrefix',
            data: { componentName: variable.name },
          });
        }
      },
    };
  },
});

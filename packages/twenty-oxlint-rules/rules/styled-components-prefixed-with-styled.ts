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
    const isStyledRoot = (node: any): boolean => {
      if (node?.type === 'Identifier' && node.name === 'styled') return true;
      if (node?.type === 'MemberExpression') return isStyledRoot(node.object);
      if (node?.type === 'CallExpression') return isStyledRoot(node.callee);
      return false;
    };

    return {
      VariableDeclarator: (node: any) => {
        const templateExpr = node.init;
        if (templateExpr?.type !== 'TaggedTemplateExpression') return;

        if (
          node.id?.type === 'Identifier' &&
          isStyledRoot(templateExpr.tag)
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

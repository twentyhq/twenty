import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-styled-components-prefixed-with-styled"
export const RULE_NAME = 'styled-components-prefixed-with-styled';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn when StyledComponents are not prefixed with Styled',
      recommended: 'recommended',
    },
    messages: {
      noStyledPrefix:
        '{{componentName}} is a StyledComponent and is not prefixed with Styled.',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    return {
      VariableDeclarator: (node) => {
        const templateExpr = node.init;

        if (templateExpr?.type !== AST_NODE_TYPES.TaggedTemplateExpression)
          return;

        const tag = templateExpr.tag;
        const tagged =
          tag.type === AST_NODE_TYPES.MemberExpression
            ? tag.object
            : tag.type === AST_NODE_TYPES.CallExpression
              ? tag.callee
              : null;

        if (
          isIdentifier(node.id) &&
          isIdentifier(tagged) &&
          tagged.name === 'styled'
        ) {
          const variable = node.id;

          if (variable.name.startsWith('Styled')) return;

          context.report({
            node,
            messageId: 'noStyledPrefix',
            data: {
              componentName: variable.name,
            },
          });
        }
      },
    };
  },
});

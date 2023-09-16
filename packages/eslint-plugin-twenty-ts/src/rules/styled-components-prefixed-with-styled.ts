import { TSESTree, ESLintUtils, AST_NODE_TYPES } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => `https://docs.twenty.com`);

const styledComponentsPrefixedWithStyledRule = createRule({
  create(context) {
    return {
      VariableDeclarator: (node: TSESTree.VariableDeclarator) => {
        const templateExpr = node.init
        if (templateExpr?.type !== AST_NODE_TYPES.TaggedTemplateExpression) {
          return;
        }
        const tag = templateExpr.tag
        const tagged = tag.type === AST_NODE_TYPES.MemberExpression ? tag.object
                          : tag.type === AST_NODE_TYPES.CallExpression ? tag.callee
                          : null 
        if (tagged?.type === AST_NODE_TYPES.Identifier && tagged.name === 'styled') {
          const variable = node.id as TSESTree.Identifier;
          if (variable.name.startsWith('Styled')) {
            return;
          }
          context.report({
            node,
            messageId: 'noStyledPrefix',
            data: {
              componentName: variable.name
            }
          });
        }
      },
    }
  },
  name: 'styled-components-prefixed-with-styled',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn when StyledComponents are not prefixed with Styled',
      recommended: "recommended"
    },
    messages: {
      noStyledPrefix: '{{componentName}} is a StyledComponent and is not prefixed with Styled.',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: []
});

module.exports = styledComponentsPrefixedWithStyledRule;

export default styledComponentsPrefixedWithStyledRule;

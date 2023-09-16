import {
  TSESTree,
  ESLintUtils,
  AST_NODE_TYPES,
} from "@typescript-eslint/utils";
import type { Identifier } from "@babel/types";

const createRule = ESLintUtils.RuleCreator((name) => `https://docs.twenty.com`);

const styledComponentsRule = createRule({
  create(context) {
    return {
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        const templateExpr = node.init;
        if (templateExpr?.type !== "TaggedTemplateExpression") {
          return;
        }
        const tag = templateExpr.tag;
        const tagged =
          tag.type === "MemberExpression"
            ? tag.object
            : tag.type === "CallExpression"
            ? tag.callee
            : null;

        if (
          tagged?.type === AST_NODE_TYPES.Identifier &&
          tagged?.name === "styled"
        ) {
          const variable = node.id as unknown as Identifier;
          if (variable?.name.startsWith("Styled")) {
            return;
          }

          context.report({
            node,
            messageId: "styledPrefix",
            data: {
              componentName: variable.name,
            },
          });
        }
      },
    };
  },
  name: "styled-components-prefixed-with-styled",
  meta: {
    docs: {
      description: "Warn when StyledComponents are not prefixed with Styled",
    },
    messages: {
      styledPrefix: `{{componentName}} is a StyledComponent and is not prefixed with Styled.`,
    },
    type: "suggestion",
    schema: [],
    fixable: "code",
  },
  defaultOptions: [],
});

export default styledComponentsRule;

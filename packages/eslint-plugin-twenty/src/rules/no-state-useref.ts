import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(() => `https://docs.twenty.com`);

const noStateUseRef = createRule({
  create: (context) => {
    return {
      CallExpression: (node) => {
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== "useRef"
        ) {
          return;
        }

        if (!node.typeArguments || !node.typeArguments.params?.length) {
          context.report({
            node,
            messageId: "noStateUseRef",
          });
          return;
        }
        const typeParam = node.typeArguments.params[0];

        if (typeParam.type !== "TSTypeReference") {
          context.report({
            node,
            messageId: "noStateUseRef",
          });
          return;
        }

        if (typeParam.typeName.type !== "Identifier") {
          context.report({
            node,
            messageId: "noStateUseRef",
          });
          return;
        }

        if (!typeParam.typeName.name.match(/^(HTML.*Element|Element)$/)) {
          context.report({
            node,
            messageId: "test",
          });
        }
      },
    };
  },
  name: "no-state-useref",
  meta: {
    docs: {
      description: "Don't use useRef for state management",
    },
    messages: {
      test: "test",
      noStateUseRef:
        "Don't use useRef for state management. See https://docs.twenty.com/developer/frontend/best-practices#do-not-use-useref-to-store-state for more details.",
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
});

module.exports = noStateUseRef;

export default noStateUseRef;

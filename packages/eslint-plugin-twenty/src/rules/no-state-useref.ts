import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(() => `https://docs.twenty.com`);

const noStateUseRef = createRule({
  create: (context) => {
    return {
      CallExpression: (node) => {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "useRef" &&
          (!node.typeParameters ||
            (node.typeParameters.params?.length &&
              node.typeParameters.params[0].type === "TSTypeReference" &&
              node.typeParameters.params[0].typeName.type === "Identifier" &&
              !node.typeParameters.params[0].typeName.name.match(
                /^(HTML.*Element|Element)$/,
              )))
        ) {
          context.report({
            node,
            messageId: "noStateUseRef",
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

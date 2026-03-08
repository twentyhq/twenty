import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'no-state-useref';

export const rule = defineRule({
  meta: {
    docs: {
      description: "Don't use useRef for state management",
    },
    messages: {
      test: 'test',
      noStateUseRef:
        "Don't use useRef for state management. See https://docs.twenty.com/developer/frontend/best-practices#do-not-use-useref-to-store-state for more details.",
    },
    type: 'suggestion',
    schema: [],
  },
  create: (context) => {
    return {
      CallExpression: (node: any) => {
        if (
          node.callee?.type !== 'Identifier' ||
          node.callee.name !== 'useRef'
        )
          return;

        const typeParam = node.typeArguments?.params[0];

        if (
          !typeParam ||
          typeParam.type !== 'TSTypeReference' ||
          typeParam.typeName?.type !== 'Identifier' ||
          !typeParam.typeName.name.match(/^(HTML.*Element|Element)$/)
        ) {
          context.report({
            node,
            messageId: 'noStateUseRef',
          });
          return;
        }
      },
    };
  },
});

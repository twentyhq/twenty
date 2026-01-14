import { ESLintUtils } from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-no-state-useref"
export const RULE_NAME = 'no-state-useref';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
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
  defaultOptions: [],
  create: (context) => {
    return {
      CallExpression: (node) => {
        if (!isIdentifier(node.callee) || node.callee.name !== 'useRef') return;

        const typeParam = node.typeArguments?.params[0];

        if (
          !typeParam ||
          typeParam.type !== 'TSTypeReference' ||
          !isIdentifier(typeParam.typeName) ||
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

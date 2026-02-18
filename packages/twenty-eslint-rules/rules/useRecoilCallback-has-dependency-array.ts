import { ESLintUtils } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-useRecoilCallback-has-dependency-array"
export const RULE_NAME = 'useRecoilCallback-has-dependency-array';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure `useRecoilCallback` is used with a dependency array',
      recommended: 'recommended',
    },
    schema: [],
    messages: {
      isNecessaryDependencyArray:
        'Is necessary dependency array with useRecoilCallback',
    },
    fixable: 'code',
  },
  defaultOptions: [],
  create: (context) => {
    return {
      CallExpression: (node) => {
        const { callee } = node;
        if (
          callee.type === 'Identifier' &&
          callee.name === 'useRecoilCallback'
        ) {
          const depsArg = node.arguments;
          if (depsArg.length === 1) {
            context.report({
              node: callee,
              messageId: 'isNecessaryDependencyArray',
              data: {
                callee,
                deps: depsArg[0],
              },
              fix: (fixer) => fixer.insertTextAfter(depsArg[0], ', []'),
            });
          }
        }
      },
    };
  },
});

import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-no-navigate-prefer-link"
export const RULE_NAME = 'no-navigate-prefer-link';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Discourage usage of navigate() where a simple <Link> component would suffice.',
    },
    messages: {
      preferLink: 'Use <Link> instead of navigate() for pure navigation.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => {
    const functionMap: Record<string, TSESTree.ArrowFunctionExpression> = {};

    const checkFunctionBodyHasSingleNavigateCall = (
      func: TSESTree.ArrowFunctionExpression,
    ) => {
      // Check for simple arrow function with single navigate call
      if (
        func.body.type === 'CallExpression' &&
        func.body.callee.type === 'Identifier' &&
        func.body.callee.name === 'navigate'
      ) {
        return true;
      }

      // Check for block arrow function with single navigate call
      if (
        func.body.type === 'BlockStatement' &&
        func.body.body.length === 1 &&
        func.body.body[0].type === 'ExpressionStatement' &&
        func.body.body[0].expression.type === 'CallExpression' &&
        func.body.body[0].expression.callee.type === 'Identifier' &&
        func.body.body[0].expression.callee.name === 'navigate'
      ) {
        return true;
      }

      return false;
    };

    return {
      VariableDeclarator: (node) => {
        // Check for function declaration on onClick
        if (
          node.init &&
          node.init.type === 'ArrowFunctionExpression' &&
          node.id.type === 'Identifier'
        ) {
          const func = node.init;
          functionMap[node.id.name] = func;

          if (checkFunctionBodyHasSingleNavigateCall(func)) {
            context.report({
              node: func,
              messageId: 'preferLink',
            });
          }
        }
      },
      JSXAttribute: (node) => {
        // Check for navigate call directly on onClick
        if (
          node.name.name === 'onClick' &&
          node.value.type === 'JSXExpressionContainer'
        ) {
          const expression = node.value.expression;

          if (
            expression.type === 'ArrowFunctionExpression' &&
            checkFunctionBodyHasSingleNavigateCall(expression)
          ) {
            context.report({
              node: expression,
              messageId: 'preferLink',
            });
          } else if (
            expression.type === 'Identifier' &&
            functionMap[expression.name]
          ) {
            const func = functionMap[expression.name];
            if (checkFunctionBodyHasSingleNavigateCall(func)) {
              context.report({
                node: expression,
                messageId: 'preferLink',
              });
            }
          }
        }
      },
    };
  },
});

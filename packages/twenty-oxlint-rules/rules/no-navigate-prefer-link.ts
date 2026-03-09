import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'no-navigate-prefer-link';

export const rule = defineRule({
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
  create: (context) => {
    const functionMap: Record<string, any> = {};

    const checkFunctionBodyHasSingleNavigateCall = (func: any) => {
      if (
        func.body.type === 'CallExpression' &&
        func.body.callee.type === 'Identifier' &&
        func.body.callee.name === 'navigate'
      ) {
        return true;
      }

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
      VariableDeclarator: (node: any) => {
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
      JSXAttribute: (node: any) => {
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
